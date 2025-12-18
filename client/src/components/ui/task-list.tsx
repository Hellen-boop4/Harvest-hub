import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TaskItem {
  id: string;
  title: string;
  progress: number;
  status: "pending" | "in-progress" | "completed";
}

interface TaskListProps {
  tasks: TaskItem[];
  maxItems?: number;
}

const statusColors = {
  pending: "bg-gray-200",
  "in-progress": "bg-blue-200",
  completed: "bg-green-200",
};

const statusTextColors = {
  pending: "text-gray-600",
  "in-progress": "text-blue-600",
  completed: "text-green-600",
};

export function TaskList({ tasks, maxItems = 5 }: TaskListProps) {
  const displayedTasks = tasks.slice(0, maxItems);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Active Tasks</h3>
      <div className="space-y-4">
        {displayedTasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-in fade-in slide-in-from-left duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{task.title}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColors[task.status]} ${statusTextColors[task.status]}`}>
                {task.progress}%
              </span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  );
}
