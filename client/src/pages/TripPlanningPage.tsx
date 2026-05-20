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
  const [currentAgent, setCurrentAgent] = useState<string>();
  const [isScrolled, setIsScrolled] = useState(false);
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
    setCurrentAgent("Orchestrator");

    try {
      // Simulate agent progression for UI feedback
      const agentSequence = ["Orchestrator", "Travel & Culture", "Logistics"];
      let agentIndex = 0;

      const agentInterval = setInterval(() => {
        agentIndex++;
        if (agentIndex < agentSequence.length) {
          setCurrentAgent(agentSequence[agentIndex]);
        } else {
          clearInterval(agentInterval);
        }
      }, 2000);

      const result = await planTrip.mutateAsync({
        destination,
        duration,
        budget,
      });

      clearInterval(agentInterval);

      const planResult = result as TripPlanResult;
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
      setCurrentAgent(undefined);
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
    setCurrentAgent(undefined);
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
            className="rounded-full px-6 gap-2 border-border/80 bg-card/60 hover:bg-card"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        {state === "form" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground mb-2">
                Plan Your Trip
              </h1>
              <div className="w-24 h-1.5 bg-accent" />
              <p className="text-muted-foreground mt-4 max-w-2xl">
                Tell us where you want to go, how long you'll stay, and your budget. We will
                create a personalized itinerary, recommend hotels, suggest local foods, and break down
                your budget across accommodation, food, transport, and activities.
              </p>
            </div>

            <TripForm onSubmit={handlePlanTrip} isLoading={planTrip.isPending} />

            <div className="pt-8 border-t border-border">
              <button
                onClick={() => setLocation("/history")}
                className="text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider transition-colors"
              >
                View Your Trip History →
              </button>
            </div>
          </div>
        )}

        {state === "planning" && (
          <div className="space-y-8">
            <AgentNetworkStatus />
          </div>
        )}

        {state === "results" && tripData && (
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
        )}
      </div>
    </div>
  );
}
