import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";

export default function FinanceDashboard() {
  const stats = [
    { title: "Total Revenue", value: "KES 2,450,000", icon: DollarSign },
    { title: "Outstanding Payments", value: "KES 125,000", icon: CreditCard },
    { title: "Monthly Growth", value: "+12.5%", icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Finance Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
