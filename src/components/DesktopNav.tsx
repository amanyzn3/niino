import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface DesktopNavProps {
  items: NavItem[];
}

export const DesktopNav = ({ items }: DesktopNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 py-2 px-4 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="w-16" /> {/* Spacer for balance */}
      </div>
    </nav>
  );
};
