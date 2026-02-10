import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  variant?: "primary" | "secondary" | "accent" | "warning" | "peach";
  className?: string;
}

export const DashboardCard = ({
  icon: Icon,
  title,
  description,
  to,
  variant = "primary",
  className,
}: DashboardCardProps) => {
  const iconBgClasses = {
    primary: "bg-primary/20",
    secondary: "bg-secondary-foreground/10",
    accent: "bg-accent-foreground/10",
    warning: "bg-warning-foreground/10",
    peach: "bg-peach-foreground/10",
  };

  return (
    <Link to={to}>
      <Card
        variant="interactive"
        className={cn("h-full", className)}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-xl",
              iconBgClasses[variant]
            )}
          >
            <Icon className="text-primary" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
