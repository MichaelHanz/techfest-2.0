import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Cloud, Hotel, UtensilsIcon } from "lucide-react";
import ItineraryTimeline from "./ItineraryTimeline";
import BudgetChart from "./BudgetChart";
import PDFExportButton from "./PDFExportButton";

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  notes: string;
}

interface HotelRecommendation {
  name: string;
  type: string;
  pricePerNight: string;
  highlights: string[];
  location: string;
}

interface TravelPlan {
  itinerary: ItineraryDay[];
  hotels: HotelRecommendation[];
  localFood: string[];
  attractions: string[];
}

interface BudgetAllocation {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  contingency: number;
}

interface TripResultsProps {
  destination: string;
  duration: number;
  budget: number;
  travelPlan: TravelPlan;
  budgetAllocation: BudgetAllocation;
  weatherOverview: string;
  tripId?: number;
  onSaveTrip?: () => void;
  onNewTrip?: () => void;
}

export default function TripResults({
  destination,
  duration,
  budget,
  travelPlan,
  budgetAllocation,
  weatherOverview,
  tripId,
  onSaveTrip,
  onNewTrip,
}: TripResultsProps) {
  return (
    <div className="w-full space-y-12">
      {/* Header with trip summary */}
      <div className="space-y-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground mb-2">
            {destination}
          </h1>
          <div className="w-24 h-1.5 bg-accent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Duration
                </p>
                <p className="text-2xl font-black text-foreground">{duration} days</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-start gap-3">
              <UtensilsIcon className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Budget
                </p>
                <p className="text-2xl font-black text-foreground">RM {budget.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-start gap-3">
              <Cloud className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Weather
                </p>
                <p className="text-sm text-foreground font-medium line-clamp-2">
                  {weatherOverview.split(".")[0]}.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Hotels section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
            Recommended Hotels
          </h2>
          <div className="w-16 h-1 bg-accent mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {travelPlan.hotels.map((hotel, idx) => (
            <Card key={idx} className="p-6 bg-card border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <Hotel className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold uppercase tracking-wide text-foreground">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    {hotel.type} • {hotel.location}
                  </p>
                </div>
              </div>

              <p className="text-lg font-black text-accent mb-3">
                {hotel.pricePerNight.includes('RM') ? hotel.pricePerNight : `RM ${hotel.pricePerNight}`}
              </p>

              <ul className="space-y-1">
                {hotel.highlights.map((highlight, hIdx) => (
                  <li key={hIdx} className="text-sm text-foreground flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Local food & attractions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
              Must-Try Foods
            </h2>
            <div className="w-16 h-1 bg-accent mt-3" />
          </div>

          <Card className="p-6 bg-card border-border space-y-3">
            {travelPlan.localFood.map((food, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-accent font-black">→</span>
                <span className="text-foreground">{food}</span>
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
              Top Attractions
            </h2>
            <div className="w-16 h-1 bg-accent mt-3" />
          </div>

          <Card className="p-6 bg-card border-border space-y-3">
            {travelPlan.attractions.map((attraction, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-accent font-black">→</span>
                <span className="text-foreground">{attraction}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Itinerary */}
      <ItineraryTimeline itinerary={travelPlan.itinerary} />

      {/* Budget */}
      <BudgetChart budgetAllocation={budgetAllocation} totalBudget={budget} />

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border">
        {onSaveTrip && (
          <Button
            onClick={onSaveTrip}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase tracking-wider py-6 text-base transition-all duration-200 active:scale-95"
          >
            Save This Trip
          </Button>
        )}
        {tripId && (
          <div className="flex-1">
            <PDFExportButton tripId={tripId} destination={destination} />
          </div>
        )}
        {onNewTrip && (
          <Button
            onClick={onNewTrip}
            variant="outline"
            className="flex-1 bg-transparent border-border text-foreground hover:bg-muted font-semibold uppercase tracking-wider py-6 text-base transition-all duration-200 active:scale-95"
          >
            Plan Another Trip
          </Button>
        )}
      </div>
    </div>
  );
}
