import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, TrendingUp, Users, Calendar } from "lucide-react";

export default function MilkStats() {
  const stats = [
    {
      title: "Today's Collection",
      value: "96.0 L",
      change: "+12%",
      icon: Droplets,
      trend: "up",
    },
    {
      title: "This Week",
      value: "658.5 L",
      change: "+8%",
      icon: Calendar,
      trend: "up",
    },
    {
      title: "Active Farmers",
      value: "24",
      change: "+2",
      icon: Users,
      trend: "up",
    },
    {
      title: "Avg. Quality",
      value: "8.5",
      change: "+0.3",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Collection Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-value-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.trend === "up" ? "text-primary" : "text-destructive"}>
                  {stat.change}
                </span>
                {" "}from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
