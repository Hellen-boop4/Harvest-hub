import { Badge } from "@/components/ui/badge";

export type StatusType = "active" | "inactive" | "pending" | "success" | "error" | "warning";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showDot?: boolean;
}

const statusConfig: Record<StatusType, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500", label: "Active" },
  inactive: { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500", label: "Inactive" },
  pending: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", label: "Pending" },
  success: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500", label: "Success" },
  error: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", label: "Error" },
  warning: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500", label: "Warning" },
};

export function StatusBadge({ status, label, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <Badge className={`${config.bg} ${config.text} flex items-center gap-1.5 animate-in fade-in duration-300`}>
      {showDot && <span className={`${config.dot} w-2 h-2 rounded-full inline-block animate-pulse`} />}
      {displayLabel}
    </Badge>
  );
}

export function AnimatedStatusBadge({ status, label, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 cursor-pointer"
      style={{
        backgroundColor: `${config.bg}`,
        color: `${config.text}`,
      }}>
      {showDot && <span className={`${config.dot} w-2 h-2 rounded-full inline-block animate-pulse`} />}
      {displayLabel}
    </div>
  );
}
