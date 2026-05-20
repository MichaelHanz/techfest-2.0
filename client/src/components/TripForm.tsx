import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface TripFormProps {
  onSubmit: (destination: string, duration: number, budget: number) => void;
  isLoading?: boolean;
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!destination.trim()) {
      newErrors.destination = "Destination is required";
    }

    if (!duration || parseInt(duration) < 1 || parseInt(duration) > 365) {
      newErrors.duration = "Duration must be between 1 and 365 days";
    }

    if (!budget || parseFloat(budget) <= 0) {
      newErrors.budget = "Budget must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(destination, parseInt(duration), parseFloat(budget));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8 bg-card border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="destination" className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Destination
          </Label>
          <Input
            id="destination"
            type="text"
            placeholder="e.g., Tokyo, Paris, Bali"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              if (errors.destination) {
                setErrors({ ...errors, destination: "" });
              }
            }}
            disabled={isLoading}
            className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-accent focus:ring-accent"
          />
          {errors.destination && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.destination}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Duration (Days)
            </Label>
            <Input
              id="duration"
              type="number"
              placeholder="e.g., 5"
              min="1"
              max="365"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                if (errors.duration) {
                  setErrors({ ...errors, duration: "" });
                }
              }}
              disabled={isLoading}
              className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-accent focus:ring-accent"
            />
            {errors.duration && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.duration}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Budget (RM)
            </Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., RM 2000"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value);
                if (errors.budget) {
                  setErrors({ ...errors, budget: "" });
                }
              }}
              disabled={isLoading}
              className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-accent focus:ring-accent"
            />
            {errors.budget && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.budget}
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase tracking-wider py-6 text-base transition-all duration-200 active:scale-95"
        >
          {isLoading ? "Planning Your Trip..." : "Plan My Trip"}
        </Button>
      </form>
    </Card>
  );
}
