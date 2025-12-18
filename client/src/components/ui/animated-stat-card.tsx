import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface AnimatedStatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

export function AnimatedStatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  color = "text-primary",
}: AnimatedStatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-muted-foreground";

  const TrendIcon =
    trend === "up"
      ? TrendingUp
      : trend === "down"
        ? TrendingDown
        : null;

  return (
    <Card className="hover-elevate border-l-4 border-l-primary overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 bg-primary/10 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-500">
            {value}
          </div>
          <div className="flex items-center gap-1">
            {TrendIcon && <TrendIcon className={`h-4 w-4 ${trendColor}`} />}
            <p className={`text-xs ${trendColor} font-medium`}>{change}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
