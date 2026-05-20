import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, MapPin, Calendar, DollarSign, Sparkles } from "lucide-react";

interface TripFormProps {
  onSubmit: (destination: string, duration: number, budget: number) => void;
  isLoading?: boolean;
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="w-full max-w-2xl mx-auto p-8 bg-card border-border/50 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Destination Field */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={focusedField === "destination" ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <MapPin className="w-5 h-5 text-accent" />
              </motion.div>
              <Label htmlFor="destination" className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Destination
              </Label>
            </div>
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
              onFocus={() => setFocusedField("destination")}
              onBlur={() => setFocusedField(null)}
              disabled={isLoading}
              className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200"
            />
            <AnimatePresence>
              {errors.destination && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.destination}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Duration and Budget Fields */}
          <motion.div className="grid grid-cols-2 gap-6" variants={itemVariants}>
            {/* Duration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={focusedField === "duration" ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Calendar className="w-5 h-5 text-accent" />
                </motion.div>
                <Label htmlFor="duration" className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Duration (Days)
                </Label>
              </div>
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
                onFocus={() => setFocusedField("duration")}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading}
                className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200"
              />
              <AnimatePresence>
                {errors.duration && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-destructive text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.duration}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={focusedField === "budget" ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <DollarSign className="w-5 h-5 text-accent" />
                </motion.div>
                <Label htmlFor="budget" className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Budget (RM)
                </Label>
              </div>
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
                onFocus={() => setFocusedField("budget")}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading}
                className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200"
              />
              <AnimatePresence>
                {errors.budget && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-destructive text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.budget}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase tracking-wider py-6 text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed gap-2"
            >
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              {isLoading ? "Planning Your Trip..." : "Plan My Trip"}
            </Button>
          </motion.div>

          {/* Info Text */}
          <motion.p
            className="text-center text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Our AI agents will analyze your preferences and create a personalized itinerary in seconds.
          </motion.p>
        </form>
      </Card>
    </motion.div>
  );
}
