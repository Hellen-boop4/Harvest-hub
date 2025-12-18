import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

export type ActivityType = "success" | "error" | "warning" | "info";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon?: React.ReactNode;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const iconMap: Record<ActivityType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-600" />,
  error: <XCircle className="h-5 w-5 text-red-600" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
};

const bgMap: Record<ActivityType, string> = {
  success: "bg-green-50 border-l-4 border-l-green-500",
  error: "bg-red-50 border-l-4 border-l-red-500",
  warning: "bg-amber-50 border-l-4 border-l-amber-500",
  info: "bg-blue-50 border-l-4 border-l-blue-500",
};

export function ActivityFeed({ activities, maxItems = 5 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={`p-3 rounded-md flex gap-3 animate-in fade-in slide-in-from-left duration-300`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex-shrink-0 mt-0.5">
                {activity.icon || iconMap[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
