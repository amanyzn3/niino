import { Star, Cloud, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecorativeHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const DecorativeHeader = ({
  title,
  subtitle,
  icon,
  className,
  size = "md",
}: DecorativeHeaderProps) => {
  const heights = {
    sm: "h-48",
    md: "h-64",
    lg: "h-80",
  };

  return (
    <header
      className={cn(
        "relative rounded-b-[2.5rem] overflow-hidden",
        heights[size],
        className
      )}
      style={{
        background: "linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)",
      }}
    >
      {/* Decorative Leaves - Top Left */}
      <div className="absolute top-4 left-2">
        <Leaf className="w-6 h-6 text-white/30 rotate-[-30deg]" />
        <Leaf className="w-5 h-5 text-white/25 rotate-[-60deg] -mt-1 ml-2" />
        <Leaf className="w-4 h-4 text-white/20 rotate-[-45deg] mt-1" />
      </div>

      {/* Decorative Leaves - Top Right */}
      <div className="absolute top-4 right-2">
        <Leaf className="w-6 h-6 text-white/30 rotate-[30deg] ml-auto" />
        <Leaf className="w-5 h-5 text-white/25 rotate-[60deg] -mt-1 mr-2" />
        <Leaf className="w-4 h-4 text-white/20 rotate-[45deg] mt-1 ml-auto" />
      </div>

      {/* Decorative Stars */}
      <Star className="absolute top-12 left-1/4 w-3 h-3 text-white/40 fill-white/40" />
      <Star className="absolute top-20 right-8 w-4 h-4 text-white/50 fill-white/50" />
      <Star className="absolute top-16 right-1/4 w-3 h-3 text-white/30 fill-white/30" />
      <Star className="absolute bottom-32 left-8 w-3 h-3 text-white/40 fill-white/40" />
      <Star className="absolute bottom-28 right-12 w-4 h-4 text-white/35 fill-white/35" />

      {/* Decorative Clouds */}
      <Cloud className="absolute top-24 left-4 w-12 h-12 text-white/20 fill-white/10" />
      <Cloud className="absolute top-32 right-6 w-16 h-16 text-white/25 fill-white/15" />
      <Cloud className="absolute bottom-20 left-1/4 w-14 h-14 text-white/20 fill-white/10" />
      <Cloud className="absolute bottom-24 right-1/4 w-10 h-10 text-white/15 fill-white/10" />

      {/* Bottom Leaves */}
      <div className="absolute bottom-8 left-4">
        <Leaf className="w-8 h-8 text-white/25 rotate-[120deg]" />
        <Leaf className="w-6 h-6 text-white/20 rotate-[150deg] -mt-2 ml-4" />
      </div>
      <div className="absolute bottom-6 right-4">
        <Leaf className="w-7 h-7 text-white/25 rotate-[-120deg]" />
        <Leaf className="w-5 h-5 text-white/20 rotate-[-150deg] -mt-2 mr-3" />
      </div>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        {icon && (
          <div className="w-20 h-20 rounded-full bg-white/20 p-1 mb-4">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-white/80 to-white/60 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
        {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
      </div>
    </header>
  );
};
