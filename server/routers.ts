import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
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

  trips: router({
    /**
     * Plan a trip using the multi-agent orchestrator.
     * Returns sessionId immediately so client can join WebSocket room before planning starts.
     */
    plan: publicProcedure
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
        const { nanoid } = await import("nanoid");
        const { wsManager } = await import("./_core/websocket");

        try {
          const sessionId = nanoid();
          console.log(`[Trip Planning] Starting trip planning for user ${ctx.user?.id || 'anonymous'}, sessionId: ${sessionId}`);

          // Start planning in background without awaiting
          // This allows client to receive sessionId immediately and join WebSocket room
          orchestratorAgent(destination, duration, budget, sessionId)
            .then(async (result) => {
              console.log(`[Trip Planning] Planning complete for sessionId: ${sessionId}`);
              
              // Generate a trip ID for this session
              const tripId = `trip_${Date.now()}`;

              // Send planning_complete event with full result
              wsManager.broadcastPlanningComplete(sessionId, {
                ...result,
                tripId,
                sessionId,
              });
              
              // Try to save to database, but don't fail if it doesn't work
              try {
                const { createTrip } = await import("./db");
                const itineraryJson = JSON.stringify(result.travelPlan);
                const budgetBreakdownJson = JSON.stringify(result.logistics.budgetAllocation);
                const weatherJson = result.logistics.weatherOverview;
                
                if (ctx.user?.id) {
                  await createTrip(
                    ctx.user.id,
                    destination,
                    duration,
                    budget,
                    itineraryJson,
                    budgetBreakdownJson,
                    weatherJson
                  );
                }
                console.log(`[Trip Planning] Trip saved to database: ${tripId}`);
              } catch (dbError) {
                console.warn(`[Trip Planning] Failed to save trip to database (non-critical):`, dbError);
              }
            })
            .catch((error) => {
              console.error("Error during background planning:", error);
              wsManager.broadcastError(sessionId, error instanceof Error ? error.message : "Unknown error");
            });

          // Return sessionId immediately so client can join WebSocket room
          return { sessionId };
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
     * Get a specific trip by ID.
     */
    getById: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getTripById } = await import("./db");

        try {
          const trip = await getTripById(input.tripId);
          if (!trip) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Trip not found",
            });
          }

          return {
            ...trip,
            itinerary: JSON.parse(trip.itinerary),
            budgetBreakdown: JSON.parse(trip.budgetBreakdown),
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          console.error("Error fetching trip:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch trip.",
          });
        }
      }),

    /**
     * Delete a trip.
     */
    delete: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getTripById, deleteTrip } = await import("./db");

        try {
          const trip = await getTripById(input.tripId);
          if (!trip) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Trip not found",
            });
          }

          // Verify the trip belongs to the user
          if (trip.userId !== ctx.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have permission to delete this trip",
            });
          }

          await deleteTrip(input.tripId);
          return { success: true };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          console.error("Error deleting trip:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete trip.",
          });
        }
      }),

    /**
     * Export a trip as PDF.
     */
    exportPDF: protectedProcedure
      .input(z.object({ tripId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getTripById } = await import("./db");
        const { generateTripPDF } = await import("./pdf-generator");

        try {
          const trip = await getTripById(input.tripId);
          if (!trip) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Trip not found",
            });
          }

          const itinerary = JSON.parse(trip.itinerary);
          const budgetBreakdown = JSON.parse(trip.budgetBreakdown);

          const pdfBuffer = await generateTripPDF({
            destination: trip.destination,
            duration: trip.duration,
            budget: trip.budget,
            itinerary,
            hotels: [],
            localFood: [],
            attractions: [],
            weatherOverview: trip.weatherOverview || "",
            budgetAllocation: budgetBreakdown,
          });

          const base64Pdf = pdfBuffer.toString("base64");
          return {
            pdf: base64Pdf,
            filename: `${trip.destination}-${trip.duration}days-trip.pdf`,
          };
        } catch (error) {
          console.error("Error exporting PDF:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to export trip as PDF.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
