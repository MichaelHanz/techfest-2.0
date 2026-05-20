import { useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface BudgetAllocation {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  contingency: number;
}

interface BudgetChartProps {
  budgetAllocation: BudgetAllocation;
  totalBudget: number;
}

export default function BudgetChart({ budgetAllocation, totalBudget }: BudgetChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [allocations, setAllocations] = useState<BudgetAllocation>(budgetAllocation);
  const [isEditing, setIsEditing] = useState(false);

  const categoryKeys: (keyof BudgetAllocation)[] = [
    "accommodation",
    "food",
    "transport",
    "activities",
    "contingency",
  ];

  const categoryLabels: Record<keyof BudgetAllocation, string> = {
    accommodation: "Accommodation",
    food: "Food",
    transport: "Transport",
    activities: "Activities",
    contingency: "Contingency",
  };

  const currentTotal = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  const data = categoryKeys
    .map((key) => ({
      name: categoryLabels[key],
      value: allocations[key],
    }))
    .filter((item) => item.value > 0);

  // Bright, vibrant color palette for budget categories
  const COLORS = [
    "#FF8C42",   // Warm orange for Accommodation
    "#2ECC71",   // Fresh green for Food
    "#3498DB",   // Vibrant blue for Transport
    "#E74C3C",   // Coral red for Activities
    "#9B59B6",   // Purple for Contingency
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = ((value / currentTotal) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-sm font-bold" style={{ color: payload[0].fill }}>
            RM {value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle mouse enter on pie segment
  const handlePieMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  // Handle mouse leave on pie segment
  const handlePieMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Handle slider change for budget allocation
  const handleSliderChange = (key: keyof BudgetAllocation, value: number) => {
    setAllocations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset to original allocations
  const handleReset = () => {
    setAllocations(budgetAllocation);
    setIsEditing(false);
  };

  // Calculate percentage for display
  const getPercentage = (value: number) => {
    return currentTotal > 0 ? ((value / currentTotal) * 100).toFixed(1) : "0";
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
          Budget Breakdown
        </h2>
        <div className="w-16 h-1 bg-accent mt-3" />
      </div>

      <Card className="p-8 bg-card border-border">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 flex items-center justify-center bg-gradient-to-br from-background/30 to-muted/20 p-6 rounded-lg">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  innerRadius={40}
                  fill="#ffffff"
                  dataKey="value"
                  paddingAngle={2}
                  onMouseEnter={(_, index) => handlePieMouseEnter(index)}
                  onMouseLeave={handlePieMouseLeave}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.4}
                      style={{
                        transition: "opacity 0.2s ease-in-out",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => (
                    <span className="text-sm text-foreground font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown table with sliders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Allocation Details
              </h3>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="text-xs"
                >
                  Reset
                </Button>
              )}
            </div>

            {categoryKeys.map((key, index) => {
              const value = allocations[key];
              const isHovered = hoveredIndex === index;
              const isNotHovered = hoveredIndex !== null && hoveredIndex !== index;
              const percentage = getPercentage(value);

              return (
                <div
                  key={key}
                  className={`space-y-2 p-3 rounded-lg border transition-all duration-200 ${
                    isHovered
                      ? "bg-accent/10 border-accent/50 shadow-md"
                      : isNotHovered
                        ? "bg-muted/10 border-border/30 opacity-50"
                        : "bg-muted/20 border-border/50 hover:border-border"
                  }`}
                  onMouseEnter={() => handlePieMouseEnter(index)}
                  onMouseLeave={handlePieMouseLeave}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full shadow-md transition-transform duration-200 ${
                          isHovered ? "scale-125" : ""
                        }`}
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${
                          isHovered ? "text-foreground font-semibold" : "text-foreground"
                        }`}
                      >
                        {categoryLabels[key]}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold transition-all duration-200 ${
                        isHovered ? "text-lg" : "text-sm"
                      }`}
                      style={{ color: COLORS[index % COLORS.length] }}
                    >
                      {percentage}%
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <Slider
                        value={[value]}
                        onValueChange={(newValue) =>
                          handleSliderChange(key, newValue[0])
                        }
                        min={0}
                        max={currentTotal + 1000}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          RM {value.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          RM {(currentTotal + 1000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      RM {value.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-4 border-t border-border mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Total Budget
                </span>
                <span className="text-lg font-black text-accent">
                  RM {currentTotal.toLocaleString()}
                </span>
              </div>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full"
                variant={isEditing ? "default" : "outline"}
              >
                {isEditing ? "Done Editing" : "Edit Budget"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Budget tips */}
      <Card className="p-4 bg-muted/30 border-border">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">
          Budget Tips
        </h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Accommodation typically takes 30-40% of your budget</li>
          <li>• Food varies greatly by destination and dining preferences</li>
          <li>• Always reserve 10-15% for unexpected expenses</li>
          <li>• Consider booking activities in advance for better rates</li>
        </ul>
      </Card>
    </div>
  );
}
