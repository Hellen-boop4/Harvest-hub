import { Card } from "@/components/ui/card";
import { LucideIcon, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: "primary" | "green" | "blue" | "amber" | "red";
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  color = "primary",
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <Card className="p-6 cursor-pointer hover-elevate transition-all duration-300 group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
          Open <ChevronRight className="h-4 w-4" />
        </div>
      </Card>
    </Link>
  );
}
