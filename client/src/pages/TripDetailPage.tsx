import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Compass, ChevronLeft } from "lucide-react";
import TripResults from "@/components/TripResults";
import { toast } from "sonner";

export default function TripDetailPage() {
  const [, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isRoute, params] = useRoute("/trip/:id");

  const tripId = params?.id ? parseInt(params.id) : null;
  const { data: trip, isLoading } = trpc.trips.getById.useQuery(
    { id: tripId! },
    { enabled: !!tripId }
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isRoute || !tripId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
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

        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-4">
              Trip Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The trip you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button
              onClick={() => setLocation("/history")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase tracking-wider py-6 px-8 transition-all duration-200 active:scale-95"
            >
              Back to Trips
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        <Button
          onClick={() => setLocation("/history")}
          variant="ghost"
          className="mb-8 text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Trips
        </Button>

        <TripResults
          destination={trip.destination}
          duration={trip.duration}
          budget={trip.budget}
          travelPlan={trip.itinerary}
          budgetAllocation={trip.budgetBreakdown}
          weatherOverview={trip.weatherOverview || ""}
          tripId={trip.id}
          onNewTrip={() => setLocation("/")}
        />
      </div>
    </div>
  );
}
