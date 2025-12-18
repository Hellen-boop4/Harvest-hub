import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter, TrendingUp, DollarSign, Users, CreditCard } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { EnterpriseMetrics } from "@/components/ui/enterprise-card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { apiJson } from "@/lib/api";

const revenueData: any[] = [];
const revenueBreakdown: any[] = [];
const payoutData: any[] = [];

export default function FinanceDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [milkEntries, setMilkEntries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const s: any = await apiJson('/api/stats');
        setStats(s?.stats || s);
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    })();

    (async () => {
      try {
        const p: any = await apiJson('/api/payouts');
        const list = Array.isArray(p) ? p : (p.results || []);
        setPayouts(list || []);
      } catch (e) {
        console.error('Failed to load payouts', e);
      }
    })();

    (async () => {
      try {
        const m: any = await apiJson('/api/milk/entries');
        const list = Array.isArray(m) ? m : (m.results || []);
        setMilkEntries(list || []);
      } catch (e) {
        console.error('Failed to load milk entries', e);
      }
    })();
  }, []);

  const metrics = [
    {
      title: "Total Revenue",
      value: stats?.milk?.totalAmount ? `KES ${Math.round(stats.milk.totalAmount).toLocaleString()}` : "KES 0",
      subtitle: "Year to date",
      color: "success" as const,
    },
    {
      title: "Total Expenses",
      value: `KES ${Math.round((payouts.reduce((s, p) => s + (p.netAmount || p.totalMilkAmount || 0), 0))).toLocaleString()}`,
      subtitle: "Player payouts",
      color: "warning" as const,
    },
    {
      title: "Net Profit",
      value: stats?.milk?.totalAmount ? `KES ${Math.round(stats.milk.totalAmount - (payouts.reduce((s, p) => s + (p.netAmount || p.totalMilkAmount || 0), 0))).toLocaleString()}` : "KES 0",
      subtitle: "Revenue minus payouts",
      color: "primary" as const,
    },
    {
      title: "Outstanding Payments",
      value: `KES ${Math.round(payouts.filter(p => !(p.paid || p.status === 'paid')).reduce((s, p) => s + (p.netAmount || p.totalMilkAmount || 0), 0)).toLocaleString()}`,
      subtitle: "Requires collection",
      color: "danger" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[{ label: "Finance" }]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Finance Dashboard</h1>
          <p className="text-muted-foreground">Financial performance and reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <EnterpriseMetrics metrics={metrics} columns={4} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Trend */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 mb-1">Monthly Average</p>
              <p className="text-2xl font-bold text-green-900">KES 298.3K</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Profit Margin</p>
              <p className="text-2xl font-bold text-blue-900">50.8%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 mb-1">Collection Rate</p>
              <p className="text-2xl font-bold text-purple-900">94.2%</p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Collections</p>
              <p className="text-2xl font-bold">KES 1.79M</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Payouts</p>
              <p className="text-2xl font-bold">KES 780K</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Farmer Satisfaction</p>
              <p className="text-2xl font-bold">96%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payouts */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Payouts</CardTitle>
            <Button size="sm" variant="outline">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Farmer</th>
                  <th className="px-4 py-2 text-left font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {payoutData.map((payout, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{payout.farmer}</td>
                    <td className="px-4 py-3">KES {payout.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{payout.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${payout.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
