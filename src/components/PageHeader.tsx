import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  backTo,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <header className={cn("mb-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {backTo && (
            <Link
              to={backTo}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft size={20} className="text-muted-foreground" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
};
