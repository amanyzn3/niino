import { Link, useNavigate } from "react-router-dom";
import { Baby, Stethoscope, Shield, Heart, ArrowRight, Star, Cloud, Leaf } from "lucide-react";
import { useEffect } from "react";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Heart,
    title: "Health Tracking",
    description: "Monitor your baby's growth, feeding, and sleep patterns",
    color: "bg-peach",
    textColor: "text-peach-foreground",
  },
  {
    icon: Stethoscope,
    title: "Expert Advice",
    description: "Get answers from certified pediatric specialists",
    color: "bg-accent",
    textColor: "text-accent-foreground",
  },
  {
    icon: Shield,
    title: "Vaccination Reminders",
    description: "Never miss an important immunization date",
    color: "bg-secondary",
    textColor: "text-secondary-foreground",
  },
];

const alerts = [
  { id: 1, type: "info", message: "Keep your baby hydrated during summer!" },
  { id: 2, type: "reminder", message: "Vaccination due in 3 days" },
];

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user) {
      if (user.role === 'parent') {
        navigate('/parent/dashboard');
      } else if (user.role === 'practitioner') {
        navigate('/practitioner/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="bg-primary/10 border-b border-primary/20">
          <div className="max-w-lg mx-auto px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-primary">
              <span className="font-medium">💡</span>
              <span>{alerts[0].message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header with Decorative Elements */}
      <header
        className="relative h-80 rounded-b-[2.5rem] overflow-hidden"
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
          <div className="w-24 h-24 rounded-full bg-white/20 p-1 mb-4 animate-float">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-white/80 to-white/60 flex items-center justify-center">
              <Baby className="w-12 h-12 text-primary/60" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Baby Health</h1>
          <p className="text-white/80 text-sm">Your trusted partner in care</p>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 -mt-8 max-w-lg mx-auto pb-8">
        {/* Features */}
        <div className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="animate-slide-up glass-card border-0 shadow-soft"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center`}
                >
                  <feature.icon size={24} className={feature.textColor} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <Link to="/login" className="block">
            <Button size="xl" className="w-full gap-2">
              Get Started
              <ArrowRight size={20} />
            </Button>
          </Link>
          <Link to="/register" className="block">
            <Button variant="outline" size="lg" className="w-full">
              Create an Account
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Index;
