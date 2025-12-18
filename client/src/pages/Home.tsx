import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { Milk, Users, DollarSign, FileText, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { AnimatedStatCard } from "@/components/ui/animated-stat-card";
import { QuickActionCard } from "@/components/ui/quick-action-card";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { StatusBadge } from "@/components/ui/status-badge";

export default function Home() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/stats')
      .then(async (res) => {
        if (!res.ok) return null;
        const body = await res.json().catch(() => null);
        return body?.stats ?? null;
      })
      .then((s) => {
        if (!mounted) return;
        if (s) setStats(s);
      })
      .catch(() => { });

    const onStats = (payload: any) => setStats(payload);
    socket.on('stats:update', onStats);

    return () => {
      mounted = false;
      socket.off('stats:update', onStats);
    };
  }, []);

  const statsCards = [
    {
      title: "Total Farmers",
      value: stats?.farmersCount?.toString() ?? "—",
      change: "+0 this month",
      icon: Users,
      color: "text-primary",
      trend: "neutral" as const,
    },
    {
      title: "Daily Collection",
      value: stats?.milk?.totalQuantity ? `${stats.milk.totalQuantity} L` : "—",
      change: "+0%",
      icon: Milk,
      color: "text-primary",
      trend: "neutral" as const,
    },
    {
      title: "Active Loans",
      value: stats?.loans?.activeLoans?.toString() ?? "—",
      change: stats?.loans?.totalDisbursed ? `KES ${Number(stats.loans.totalDisbursed).toLocaleString()}` : "—",
      icon: DollarSign,
      color: "text-primary",
      trend: "neutral" as const,
    },
    {
      title: "Monthly Revenue",
      value: stats?.loans?.totalRepaid ? `KES ${Number(stats.loans.totalRepaid).toLocaleString()}` : "—",
      change: "+0%",
      icon: TrendingUp,
      color: "text-primary",
      trend: "neutral" as const,
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

  const monthlyCollection = [
    { month: "Jan", collected: 1200, target: 1500 },
    { month: "Feb", collected: 1350, target: 1500 },
    { month: "Mar", collected: 1480, target: 1500 },
    { month: "Apr", collected: 1400, target: 1500 },
    { month: "May", collected: 1550, target: 1500 },
    { month: "Jun", collected: 1245, target: 1500 },
  ];

  const recentActivities = [
    {
      id: "1",
      type: "success" as const,
      title: "Milk collection completed",
      description: "Collected 245L from region Kiambu",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "info" as const,
      title: "New farmer registered",
      description: "John Kipchoge from Nyeri",
      timestamp: "4 hours ago",
    },
    {
      id: "3",
      type: "warning" as const,
      title: "Overdue loan reminder",
      description: "Farmer ID #45 - Amount: KES 5,000",
      timestamp: "6 hours ago",
    },
    {
      id: "4",
      type: "success" as const,
      title: "Loan payment received",
      description: "Payment from Farmer ID #32",
      timestamp: "1 day ago",
    },
    {
      id: "5",
      type: "info" as const,
      title: "Finance report generated",
      description: "Monthly summary ready for review",
      timestamp: "2 days ago",
    },
  ];

  return (
    <div className="relative w-full h-full -mt-28 -mx-6 pt-28 px-6 pb-8">
      {/* Green gradient background with animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background -z-10 animate-fade-in"></div>

      <div className="w-full space-y-8">
        {/* Header */}
        <div className="animate-slide-down">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome to Harvest Hub
          </h1>
          <p className="text-muted-foreground text-lg">
            Your agricultural management system
          </p>
        </div>

        {/* Statistics Cards with Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={stat.title}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <AnimatedStatCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                color={stat.color}
                trend={stat.trend}
              />
            </div>
          ))}
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Add Milk Collection"
            description="Record daily milk collections"
            icon={Milk}
            href="/milk/add"
            color="green"
          />
          <QuickActionCard
            title="Manage Farmers"
            description="View and manage farmer profiles"
            icon={Users}
            href="/farmers/dashboard"
            color="primary"
          />
          <QuickActionCard
            title="Process Loans"
            description="Handle loan applications"
            icon={DollarSign}
            href="/loans/dashboard"
            color="blue"
          />
          <QuickActionCard
            title="Generate Reports"
            description="Export financial reports"
            icon={FileText}
            href="/finance/dashboard"
            color="amber"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Farmers by Region */}
          <Card className="hover-elevate transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Farmers by Region</span>
                <StatusBadge status="active" label="Live" showDot={true} />
              </CardTitle>
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
                    animationDuration={800}
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
          <Card className="hover-elevate transition-all duration-300">
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
                    animationDuration={800}
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
          <Card className="hover-elevate transition-all duration-300">
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
                    animationDuration={800}
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

        {/* Monthly Collection Bar Chart */}
        <Card className="hover-elevate transition-all duration-300">
          <CardHeader>
            <CardTitle>Monthly Collection Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #e5e7eb" }}
                  cursor={{ fill: "rgba(22, 163, 74, 0.1)" }}
                />
                <Legend />
                <Bar dataKey="collected" fill="#16a34a" radius={[8, 8, 0, 0]} animationDuration={800} />
                <Bar dataKey="target" fill="#22c55e" radius={[8, 8, 0, 0]} opacity={0.6} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Feed and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityFeed activities={recentActivities} maxItems={6} />
          </div>

          {/* Summary Card */}
          <Card className="hover-elevate transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle>System Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-2xl font-bold text-primary">12</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium">Tasks Today</span>
                <StatusBadge status="active" label="8 Pending" />
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium">System Status</span>
                <StatusBadge status="success" label="Operational" />
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-xs text-muted-foreground">Just now</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
