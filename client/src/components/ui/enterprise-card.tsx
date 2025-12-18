import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { Link } from "wouter";

interface MetricCard {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "primary" | "success" | "warning" | "danger" | "info";
  icon?: React.ReactNode;
}

interface EnterpriseMetricsProps {
  metrics: MetricCard[];
  columns?: number;
}

const colorClasses = {
  primary: "bg-blue-50 border-l-4 border-l-blue-500",
  success: "bg-green-50 border-l-4 border-l-green-500",
  warning: "bg-yellow-50 border-l-4 border-l-yellow-500",
  danger: "bg-red-50 border-l-4 border-l-red-500",
  info: "bg-purple-50 border-l-4 border-l-purple-500",
};

const textClasses = {
  primary: "text-blue-900",
  success: "text-green-900",
  warning: "text-yellow-900",
  danger: "text-red-900",
  info: "text-purple-900",
};

export function EnterpriseMetrics({
  metrics,
  columns = 4,
}: EnterpriseMetricsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg ${colorClasses[metric.color || "primary"]} hover-elevate transition-all`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${textClasses[metric.color || "primary"]}`}>
                {metric.title}
              </p>
              <p className={`text-3xl font-bold mt-2 ${textClasses[metric.color || "primary"]}`}>
                {metric.value}
              </p>
              {metric.subtitle && (
                <p className={`text-xs mt-1 ${textClasses[metric.color || "primary"]} opacity-75`}>
                  {metric.subtitle}
                </p>
              )}
            </div>
            {metric.icon && <div className="text-2xl opacity-20 ml-2">{metric.icon}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

interface EnterpriseCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: Array<{ label: string; value: string; content: React.ReactNode }>;
}

export function EnterpriseCard({
  title,
  subtitle,
  children,
  actions,
  tabs,
}: EnterpriseCardProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {tabs ? (
          <Tabs defaultValue={tabs[0].value}>
            <TabsList className="grid w-full grid-cols-{tabs.length}">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; direction: "up" | "down" | "neutral" };
  color?: string;
  clickable?: boolean;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  trend,
  color = "bg-blue-50",
  clickable = false,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={`p-4 rounded-lg ${color} ${clickable ? "cursor-pointer hover-elevate" : ""
        }`}
      onClick={onClick}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <span
            className={`text-xs font-semibold ${trend.direction === "up"
                ? "text-green-600"
                : trend.direction === "down"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
          >
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}{" "}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
