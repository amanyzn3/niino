import { Baby } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "gradient-primary rounded-2xl flex items-center justify-center shadow-soft",
          sizeClasses[size]
        )}
      >
        <Baby className="text-primary-foreground" size={size === "lg" ? 28 : size === "md" ? 22 : 18} />
      </div>
      {showText && (
        <span className={cn("font-bold text-foreground", textSizeClasses[size])}>
          NINO <span className="text-primary">CARE</span>
        </span>
      )}
    </div>
  );
};
