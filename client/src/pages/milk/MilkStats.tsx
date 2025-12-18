import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, TrendingUp, Users, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";

export default function MilkStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const s: any = await apiJson('/api/stats');
        setStats(s?.stats || s);
      } catch (e) {
        console.error('Failed to load stats for MilkStats', e);
      }
    })();
  }, []);

  const display = [
    { title: "Total Collected", value: `${stats?.milk?.totalQuantity ?? 0} L`, icon: Droplets, note: `KES ${Math.round(stats?.milk?.totalAmount || 0).toLocaleString()}` },
    { title: "Total Value", value: `KES ${Math.round(stats?.milk?.totalAmount || 0).toLocaleString()}`, icon: Calendar, note: `Overall` },
    { title: "Active Farmers", value: `${stats?.farmersCount ?? 0}`, icon: Users, note: "Registered" },
    { title: "Active Loans", value: `${stats?.loans?.activeLoans ?? 0}`, icon: TrendingUp, note: "Active" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Collection Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {display.map((stat) => (
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
              <p className="text-xs text-muted-foreground mt-1">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
