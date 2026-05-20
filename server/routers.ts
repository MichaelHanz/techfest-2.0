import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Trip planning and history management
  trips: router({
    /**
     * Plan a trip using the multi-agent orchestrator.
     * Accepts destination, duration, and budget, returns the complete trip plan.
     */
    plan: protectedProcedure
      .input(
        z.object({
          destination: z.string().min(1, "Destination is required"),
          duration: z.number().int().min(1, "Duration must be at least 1 day").max(365),
          budget: z.number().positive("Budget must be positive"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { destination, duration, budget } = input;
        const { orchestratorAgent } = await import("./agents");
        const { createTrip } = await import("./db");
        const { nanoid } = await import("nanoid");

        try {
          // Generate a unique session ID for WebSocket communication
          const sessionId = nanoid();

          // Run the orchestrator agent to generate the trip plan with real-time WebSocket updates
          const result = await orchestratorAgent(destination, duration, budget, sessionId);

          // Save the trip to the database
          const itineraryJson = JSON.stringify(result.travelPlan);
          const budgetBreakdownJson = JSON.stringify(result.logistics.budgetAllocation);
          const weatherJson = result.logistics.weatherOverview;

          const tripId = await createTrip(
            ctx.user.id,
            destination,
            duration,
            budget,
            itineraryJson,
            budgetBreakdownJson,
            weatherJson
          );

          return {
            ...result,
            tripId,
            sessionId,
          };
        } catch (error) {
          console.error("Error planning trip:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to plan trip. Please try again.",
          });
        }
      }),

    /**
     * Get all trips for the current user.
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserTrips } = await import("./db");

      try {
        const trips = await getUserTrips(ctx.user.id);
        return trips.map((trip) => ({
          ...trip,
          itinerary: JSON.parse(trip.itinerary),
          budgetBreakdown: JSON.parse(trip.budgetBreakdown),
        }));
      } catch (error) {
        console.error("Error fetching trips:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch trips.",
        });
      }
    }),

    /**
     * Get a single trip by ID.
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getTripById } = await import("./db");

        try {
          const trip = await getTripById(input.id);
          if (!trip) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Trip not found.",
            });
          }

          // Verify ownership
          if (trip.userId !== ctx.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have access to this trip.",
            });
          }

          return {
            ...trip,
            itinerary: JSON.parse(trip.itinerary),
            budgetBreakdown: JSON.parse(trip.budgetBreakdown),
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching trip:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch trip.",
          });
        }
      }),

    /**
     * Delete a trip by ID.
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getTripById, deleteTrip } = await import("./db");

        try {
          const trip = await getTripById(input.id);
          if (!trip) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Trip not found.",
            });
          }

          // Verify ownership
          if (trip.userId !== ctx.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have access to this trip.",
            });
          }

          await deleteTrip(input.id);
          return { success: true };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error deleting trip:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete trip.",
          });
        }
      }),

    /**
     * Export a trip as a PDF document.
     * Generates a professional PDF with itinerary, hotels, budget breakdown, and attractions.
     */
    exportPDF: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getTripById } = await import("./db");
        const { generateTripPDF } = await import("./pdf-generator");

        try {
          const trip = await getTripById(input.id);
          if (!trip) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Trip not found.",
            });
          }

          // Verify ownership
          if (trip.userId !== ctx.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have access to this trip.",
            });
          }

          // Parse the stored JSON data
          const itinerary = JSON.parse(trip.itinerary);
          const budgetBreakdown = JSON.parse(trip.budgetBreakdown);

          // Generate PDF
          const pdfBuffer = await generateTripPDF({
            destination: trip.destination,
            duration: trip.duration,
            budget: trip.budget,
            itinerary: itinerary.itinerary || [],
            hotels: itinerary.hotels || [],
            localFood: itinerary.localFood || [],
            attractions: itinerary.attractions || [],
            weatherOverview: trip.weatherOverview || "Weather information not available.",
            budgetAllocation: budgetBreakdown,
          });

          // Return PDF as base64 for download
          return {
            pdf: pdfBuffer.toString("base64"),
            filename: `${trip.destination.replace(/\s+/g, "-").toLowerCase()}-trip-plan.pdf`,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error exporting trip to PDF:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to export trip to PDF.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
