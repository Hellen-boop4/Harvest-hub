import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricComparisonProps {
  title: string;
  current: number;
  previous: number;
  unit?: string;
  icon: LucideIcon;
  showPercentage?: boolean;
}

export function MetricComparison({
  title,
  current,
  previous,
  unit = "",
  icon: Icon,
  showPercentage = true,
}: MetricComparisonProps) {
  const change = current - previous;
  const percentageChange = ((change / previous) * 100).toFixed(1);
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <Card className="hover-elevate">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {current}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>

          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : isNeutral ? (
              <Minus className="h-4 w-4 text-gray-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${isPositive ? "text-green-600" : isNeutral ? "text-gray-600" : "text-red-600"
                }`}
            >
              {isPositive ? "+" : ""}
              {change} {unit}
              {showPercentage && ` (${isPositive ? "+" : ""}${percentageChange}%)`}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">vs. previous period: {previous} {unit}</p>
        </div>
      </CardContent>
    </Card>
  );
}
