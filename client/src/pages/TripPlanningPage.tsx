import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Compass, ChevronLeft } from "lucide-react";
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
      <header className={`sticky top-0 z-50 border-b border-border/80 bg-card/40 backdrop-blur-sm transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}>
        <div className="container flex items-center justify-between py-6">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="Home"
          >
            <div className="h-10 w-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Generative AI</p>
              <p className="text-lg font-semibold">Smart Travel Planner</p>
            </div>
          </button>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {state === "form" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Plan Your Trip</h1>
              <p className="text-muted-foreground">
                Let our AI agents create a personalized itinerary and budget plan for your journey.
              </p>
            </div>
            <TripForm onSubmit={handlePlanTrip} isLoading={planTrip.isPending} />
          </div>
        )}

        {state === "planning" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Planning Your Trip</h2>
              <p className="text-muted-foreground">
                Our AI agents are working together to create your perfect itinerary...
              </p>
            </div>
            <AgentNetworkStatus sessionId={sessionId} />
          </div>
        )}

        {state === "results" && tripData && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Trip Plan</h2>
              <p className="text-muted-foreground">
                {tripData.destination} • {tripData.duration} Days • RM {tripData.budget.toLocaleString()}
              </p>
            </div>
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
            <div className="mt-8 flex gap-4 justify-center">
              <Button onClick={handleNewTrip} variant="outline">
                Plan Another Trip
              </Button>
              <Button onClick={handleSaveTrip}>
                Save to History
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
