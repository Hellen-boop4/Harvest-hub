import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Milk, Users, DollarSign, FileText, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function Home() {
  const statsCards = [
    {
      title: "Total Farmers",
      value: "124",
      change: "+12 this month",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Daily Collection",
      value: "1,245 L",
      change: "+8% from yesterday",
      icon: Milk,
      color: "text-primary",
    },
    {
      title: "Active Loans",
      value: "42",
      change: "KES 2.1M outstanding",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Monthly Revenue",
      value: "KES 450K",
      change: "+15% from last month",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  const farmersByRegion = [
    { name: "Kiambu", value: 45, color: "#16a34a" },
    { name: "Nyeri", value: 32, color: "#22c55e" },
    { name: "Kisumu", value: 28, color: "#4ade80" },
    { name: "Siaya", value: 19, color: "#86efac" },
  ];

  const collectionStats = [
    { name: "Morning", value: 65, color: "#16a34a" },
    { name: "Evening", value: 35, color: "#4ade80" },
  ];

  const loanStatus = [
    { name: "Active", value: 42, color: "#16a34a" },
    { name: "Paid", value: 38, color: "#86efac" },
    { name: "Overdue", value: 8, color: "#fbbf24" },
  ];

  return (
    <div className="relative min-h-screen -mt-28 -mx-6 pt-28 px-6">
      {/* Green gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Harvest Hub
          </h1>
          <p className="text-muted-foreground">
            Your complete agricultural management system
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Farmers by Region */}
          <Card>
            <CardHeader>
              <CardTitle>Farmers by Region</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={farmersByRegion}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {farmersByRegion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Collection Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={collectionStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {collectionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Loan Status */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={loanStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {loanStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-md border hover-elevate">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Farmers</p>
                  <p className="text-sm text-muted-foreground">124 registered</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-md border hover-elevate">
                <Milk className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Collections</p>
                  <p className="text-sm text-muted-foreground">Daily tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-md border hover-elevate">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Loans</p>
                  <p className="text-sm text-muted-foreground">42 active</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-md border hover-elevate">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Reports</p>
                  <p className="text-sm text-muted-foreground">View analytics</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
