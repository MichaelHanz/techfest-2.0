import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

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
  const data = [
    { name: "Accommodation", value: budgetAllocation.accommodation },
    { name: "Food", value: budgetAllocation.food },
    { name: "Transport", value: budgetAllocation.transport },
    { name: "Activities", value: budgetAllocation.activities },
    { name: "Contingency", value: budgetAllocation.contingency },
  ].filter((item) => item.value > 0);

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
      const percentage = ((value / totalBudget) * 100).toFixed(1);
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
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

          {/* Breakdown table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-4">
              Allocation Details
            </h3>
            {data.map((item, index) => (
              <div key={item.name} className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50 hover:border-border transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-md"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                    {((item.value / totalBudget) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  RM {item.value.toLocaleString()}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Total Budget
                </span>
                <span className="text-lg font-black text-accent">
                  RM {totalBudget.toLocaleString()}
                </span>
              </div>
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
