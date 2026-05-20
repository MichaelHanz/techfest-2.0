import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Compass, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripForm from "@/components/TripForm";
import AgentNetworkStatus from "@/components/AgentNetworkStatus";
import TripResults from "@/components/TripResults";

type PlanningState = "form" | "planning" | "results";

interface TripPlanResult {
  travelPlan: {
    itinerary: Array<{
      day: number;
      title: string;
      activities: string[];
      meals: string[];
      notes: string;
    }>;
    hotels: Array<{
      name: string;
      type: string;
      pricePerNight: string;
      highlights: string[];
      location: string;
    }>;
    localFood: string[];
    attractions: string[];
  };
  logistics: {
    weatherOverview: string;
    budgetAllocation: {
      accommodation: number;
      food: number;
      transport: number;
      activities: number;
      contingency: number;
    };
    recommendations: string[];
  };
  tripId: number;
}

export default function TripPlanningPage() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<PlanningState>("form");
  const [isScrolled, setIsScrolled] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [tripData, setTripData] = useState<{
    destination: string;
    duration: number;
    budget: number;
    tripId: number;
    result: TripPlanResult;
  } | null>(null);

  const planTrip = trpc.trips.plan.useMutation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePlanTrip = async (destination: string, duration: number, budget: number) => {
    setState("planning");

    try {
      // Initiate trip planning - returns sessionId immediately
      const response = await planTrip.mutateAsync({
        destination,
        duration,
        budget,
      });

      const newSessionId = (response as { sessionId: string }).sessionId;
      setSessionId(newSessionId);

      // Wait for planning_complete event via WebSocket
      // The AgentNetworkStatus component will handle real-time updates
      const planningCompletePromise = new Promise<TripPlanResult & { tripId: number }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Planning timeout"));
        }, 300000); // 5 minute timeout

        // Listen for planning_complete event
        const handlePlanningComplete = ((event: any) => {
          clearTimeout(timeout);
          window.removeEventListener(`planning-complete-${newSessionId}`, handlePlanningComplete as EventListener);
          resolve(event.detail);
        }) as EventListener;

        window.addEventListener(`planning-complete-${newSessionId}`, handlePlanningComplete);
      });

      const planResult = await planningCompletePromise;

      setTripData({
        destination,
        duration,
        budget,
        tripId: planResult.tripId,
        result: planResult,
      });

      setState("results");
      toast.success("Trip plan created successfully!");
    } catch (error) {
      setState("form");
      setSessionId(null);
      toast.error("Failed to plan trip. Please try again.");
      console.error(error);
    }
  };

  const handleSaveTrip = () => {
    toast.success("Trip saved to your history!");
    setLocation("/history");
  };

  const handleNewTrip = () => {
    setState("form");
    setTripData(null);
    setSessionId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <header
        className={`sticky top-0 z-50 border-b border-border/80 transition-all duration-300 ${
          isScrolled ? "bg-card/60 shadow-lg backdrop-blur-md" : "bg-card/40 backdrop-blur-sm"
        }`}
      >
        <div className="container flex items-center justify-between py-4 px-6">
          <motion.button
            onClick={() => setLocation("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="Home"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-10 w-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Generative AI</p>
              <p className="text-lg font-semibold">Smart Travel Planner</p>
            </div>
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 px-6">
        <AnimatePresence mode="wait">
          {state === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <motion.div
                className="mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-accent" />
                  </motion.div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                    Plan Your Trip
                  </h1>
                </div>
                <p className="text-muted-foreground text-lg">
                  Let our AI agents create a personalized itinerary and budget plan for your journey.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <TripForm onSubmit={handlePlanTrip} isLoading={planTrip.isPending} />
              </motion.div>
            </motion.div>
          )}

          {state === "planning" && (
            <motion.div
              key="planning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <motion.div
                className="mb-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-accent" />
                  </motion.div>
                  <h2 className="text-3xl font-bold">Planning Your Trip</h2>
                </div>
                <p className="text-muted-foreground text-lg">
                  Our AI agents are working together to create your perfect itinerary...
                </p>
              </motion.div>

              {/* Agent Network Status with enhanced spacing */}
              <motion.div
                className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AgentNetworkStatus sessionId={sessionId} />
              </motion.div>
            </motion.div>
          )}

          {state === "results" && tripData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-accent" />
                  </motion.div>
                  <h2 className="text-3xl font-bold">Your Trip Plan</h2>
                </div>
                <p className="text-muted-foreground text-lg">
                  {tripData.destination} • {tripData.duration} Days • RM {tripData.budget.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <TripResults
                  destination={tripData.destination}
                  duration={tripData.duration}
                  budget={tripData.budget}
                  travelPlan={tripData.result.travelPlan}
                  budgetAllocation={tripData.result.logistics.budgetAllocation}
                  weatherOverview={tripData.result.logistics.weatherOverview}
                  tripId={tripData.tripId}
                  onSaveTrip={handleSaveTrip}
                  onNewTrip={handleNewTrip}
                />
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="mt-12 flex gap-4 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleNewTrip} variant="outline" size="lg">
                    Plan Another Trip
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleSaveTrip} size="lg" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Save to History
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
