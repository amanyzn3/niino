import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircleQuestion,
  FileText,
  User,
  Home,
  Settings,
  Clock,
  CheckCircle,
  Stethoscope,
  Star,
  Cloud,
  Leaf
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardCard } from "@/components/DashboardCard";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { queryAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { icon: Home, label: "Home", path: "/practitioner/dashboard" },
  { icon: MessageCircleQuestion, label: "Queries", path: "/practitioner/queries" },
  { icon: FileText, label: "Content", path: "/practitioner/content" },
  { icon: User, label: "Profile", path: "/practitioner/profile" },
];

const PractitionerDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const pendingQueries = queries.filter((q) => q.status === "pending").length;
    const answeredToday = queries.filter((q) => {
      if (q.status !== "answered" || !q.updatedAt) return false;
      const updated = new Date(q.updatedAt);
      const now = new Date();
      return (
        updated.getFullYear() === now.getFullYear() &&
        updated.getMonth() === now.getMonth() &&
        updated.getDate() === now.getDate()
      );
    }).length;

    return { pendingQueries, answeredToday };
  }, [queries]);

  const recentPending = useMemo(
    () => queries.filter((q) => q.status === "pending").slice(0, 3),
    [queries]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [p, q] = await Promise.all([
          userAPI.getProfile(),
          queryAPI.getAll("all"),
        ]);
        if (!mounted) return;
        setProfile(p);
        setQueries(Array.isArray(q) ? q : []);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onPickPhoto = async (file: File) => {
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });

      const updated = await userAPI.updateProfile({ avatar: dataUrl });
      setProfile(updated);
      toast.success("Photo updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update photo");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-24">
      <DesktopNav items={navItems} />

      {/* Decorative Header */}
      <header
        className="relative h-56 md:h-44 md:mt-2 rounded-b-[2.5rem] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)",
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-4 left-2">
          <Leaf className="w-6 h-6 text-white/30 rotate-[-30deg]" />
          <Leaf className="w-5 h-5 text-white/25 rotate-[-60deg] -mt-1 ml-2" />
          <Leaf className="w-4 h-4 text-white/20 rotate-[-45deg] mt-1" />
        </div>
        <div className="absolute top-4 right-2">
          <Leaf className="w-6 h-6 text-white/30 rotate-[30deg] ml-auto" />
          <Leaf className="w-5 h-5 text-white/25 rotate-[60deg] -mt-1 mr-2" />
          <Leaf className="w-4 h-4 text-white/20 rotate-[45deg] mt-1 ml-auto" />
        </div>
        <Star className="absolute top-12 left-1/4 w-3 h-3 text-white/40 fill-white/40" />
        <Star className="absolute top-20 right-8 w-4 h-4 text-white/50 fill-white/50" />
        <Star className="absolute top-16 right-1/4 w-3 h-3 text-white/30 fill-white/30" />
        <Cloud className="absolute top-24 left-4 w-12 h-12 text-white/20 fill-white/10" />
        <Cloud className="absolute top-28 right-6 w-16 h-16 text-white/25 fill-white/15" />
        <div className="absolute bottom-4 left-4">
          <Leaf className="w-8 h-8 text-white/25 rotate-[120deg]" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Leaf className="w-7 h-7 text-white/25 rotate-[-120deg]" />
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickPhoto(file);
                if (e.target) e.target.value = "";
              }}
            />
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add profile photo"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 p-1 mb-2 relative">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-white/80 to-white/60 flex items-center justify-center overflow-hidden">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Stethoscope className="w-10 h-10 md:w-12 md:h-12 text-primary/60" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Add Photo</span>
                </div>
              </div>
            </button>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-0.5">
            {profile?.fullName || (loading ? "Loading..." : "Practitioner")}
          </h1>
          <p className="text-white/80 text-sm">{profile?.specialization || ""}</p>
        </div>

        {/* Settings Button */}
        <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
          <Settings size={20} className="text-white" />
        </button>
      </header>

      {/* Stats Cards - Overlapping */}
      <div className="px-4 mt-4 max-w-lg mx-auto md:max-w-4xl">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 pl-1">QUERIES OVERVIEW</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="bg-card shadow-soft border-0 animate-slide-up cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            onClick={() => navigate("/practitioner/queries?status=pending")}
          >
            <CardContent className="py-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-pending/20 flex items-center justify-center mb-1">
                <Clock size={24} className="text-pending-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.pendingQueries}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-card shadow-soft border-0 animate-slide-up cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            style={{ animationDelay: "50ms" }}
            onClick={() => navigate("/practitioner/queries?status=answered")}
          >
            <CardContent className="py-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center mb-1">
                <CheckCircle size={24} className="text-success-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.answeredToday}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">Answered Today</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="px-4 mt-8 max-w-lg mx-auto md:max-w-4xl">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 pl-1">QUICK ACTIONS</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            icon={MessageCircleQuestion}
            title="Manage Queries"
            description="View and respond to parent questions"
            to="/practitioner/queries"
            className="bg-gradient-to-br from-card to-muted/30 hover:to-muted/50 border-primary/10"
          />
          <DashboardCard
            icon={FileText}
            title="Expert Content"
            description="Publish articles and health tips"
            to="/practitioner/content"
            className="bg-gradient-to-br from-card to-muted/30 hover:to-muted/50 border-primary/10"
          />
          <DashboardCard
            icon={User}
            title="My Profile"
            description="Manage your professional details"
            to="/practitioner/profile"
            className="bg-gradient-to-br from-card to-muted/30 hover:to-muted/50 border-primary/10"
          />
        </div>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
};

export default PractitionerDashboard;
