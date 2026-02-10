import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface BottomNavProps {
  items: NavItem[];
}

export const BottomNav = ({ items }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-sm border-t border-border/50 z-50 md:hidden">
      <div className="flex items-center justify-around py-3 px-4 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-primary"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};