import { MapPin, Utensils, FileText } from "lucide-react";

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  notes: string;
}

interface ItineraryTimelineProps {
  itinerary: ItineraryDay[];
}

export default function ItineraryTimeline({ itinerary }: ItineraryTimelineProps) {
  return (
    <div className="w-full space-y-4">
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
          Your Itinerary
        </h2>
        <div className="w-16 h-1 bg-accent mt-3" />
      </div>

      {/* Timeline container */}
      <div className="relative pl-12">
        {/* Vertical timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent/40" />

        {/* Timeline items */}
        <div className="space-y-8">
          {itinerary.map((day, index) => (
            <div key={day.day} className="relative">
              {/* Timeline node - circular marker on the line */}
              <div className="absolute -left-8 top-2 w-6 h-6 rounded-full bg-accent border-4 border-card shadow-lg" />

              {/* Day content */}
              <div className="space-y-3">
                {/* Day title */}
                <h3 className="text-lg font-bold uppercase tracking-wide text-foreground">
                  Day {day.day}: {day.title}
                </h3>

                {/* Activities section */}
                {day.activities.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Activities
                      </span>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="text-sm text-foreground flex gap-2">
                          <span className="text-accent/70">•</span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dining section */}
                {day.meals.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Dining
                      </span>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {day.meals.map((meal, idx) => (
                        <li key={idx} className="text-sm text-foreground flex gap-2">
                          <span className="text-accent/70">•</span>
                          <span>{meal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes section */}
                {day.notes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Notes
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6 italic">
                      {day.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Subtle divider between days (except last) */}
              {index !== itinerary.length - 1 && (
                <div className="mt-8 pt-8 border-t border-border/30" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional recommendations section */}
      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-xl font-bold uppercase tracking-wide text-foreground mb-4">
          Pro Tips
        </h3>
        <div className="bg-muted/30 border border-border p-4 space-y-2">
          <p className="text-sm text-foreground">
            • Arrive early at popular attractions to avoid crowds
          </p>
          <p className="text-sm text-foreground">
            • Keep some flexibility in your schedule for spontaneous discoveries
          </p>
          <p className="text-sm text-foreground">
            • Download offline maps and transportation apps before your trip
          </p>
        </div>
      </div>
    </div>
  );
}
