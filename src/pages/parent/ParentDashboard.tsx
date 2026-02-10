import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  HeartPulse,
  MessageCircleQuestion,
  Syringe,
  FileBarChart,
  Baby,
  Home,
  Thermometer,
  Utensils,
  Moon,
  Leaf,
  Activity,
  ChevronDown,
  Trash2,
  Star,
  Cloud,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardCard } from "@/components/DashboardCard";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { healthLogAPI, userAPI, vaccinationAPI, babyAPI, contentAPI } from "@/lib/api";
import { toast } from "sonner";
import { format, differenceInMonths, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateSchedule } from "@/lib/vaccineSchedule";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";



const dailyTips = [
  { id: 1, title: "Tummy Time", tip: "Give your baby 15-20 minutes of tummy time daily to strengthen neck and shoulder muscles.", icon: "💪" },
  { id: 2, title: "Sleep Safety", tip: "Always place your baby on their back to sleep. Keep the crib free of blankets and toys.", icon: "😴" },
  { id: 3, title: "Hydration", tip: "Babies under 6 months get all hydration from breast milk or formula. No extra water needed!", icon: "💧" },
];

const navItems = [
  { icon: Home, label: "Home", path: "/parent/dashboard" },
  { icon: HeartPulse, label: "Health", path: "/parent/health-log" },
  { icon: Syringe, label: "Vaccines", path: "/parent/vaccination" },
  { icon: MessageCircleQuestion, label: "Ask", path: "/parent/query" },
  { icon: User, label: "Profile", path: "/parent/profile" },
];

const quickActions = [
  { icon: Utensils, label: "Log Feed", color: "bg-peach", type: "feed" },
  { icon: Moon, label: "Log Sleep", color: "bg-secondary", type: "sleep" },
  { icon: Thermometer, label: "Log Temp", color: "bg-accent", type: "temp" },
  { icon: Activity, label: "Symptom", color: "bg-mint", type: "symptom" },
];

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const babyPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [upcomingVaccines, setUpcomingVaccines] = useState<any[]>([]);

  const [feedData, setFeedData] = useState({ type: "", amount: "", notes: "" });
  const [sleepData, setSleepData] = useState({ hours: "", quality: "", notes: "" });
  const [tempData, setTempData] = useState({ temperature: "", notes: "" });
  const [symptomData, setSymptomData] = useState({ symptom: "", severity: "", notes: "" });
  const [user, setUser] = useState<any>(null);
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const handleDeleteTip = (id: string) => {
    setTips(prev => prev.filter(t => t._id !== id));
    toast.success("Article removed from dashboard");
  };

  // Multiple Baby State
  const [babies, setBabies] = useState<any[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndBabies();
  }, []);

  // Handle baby selection logic: params > localStorage > default
  useEffect(() => {
    if (babies.length > 0) {
      const paramId = searchParams.get("babyId");
      const storedId = localStorage.getItem("selectedBabyId");

      let targetId = null;

      if (paramId && babies.some(b => b._id === paramId)) {
        targetId = paramId;
      } else if (storedId && babies.some(b => b._id === storedId)) {
        targetId = storedId;
      } else {
        targetId = babies[0]._id;
      }

      if (targetId && targetId !== selectedBabyId) {
        setSelectedBabyId(targetId);
        // Sync URL and LocalStorage
        if (targetId !== paramId) setSearchParams({ babyId: targetId });
        localStorage.setItem("selectedBabyId", targetId);
      }
    }
  }, [babies, searchParams]);

  useEffect(() => {
    if (selectedBabyId) {
      loadBabySpecificData(selectedBabyId);
    }
  }, [selectedBabyId]);

  const loadUserAndBabies = async () => {
    try {
      const userData = await userAPI.getProfile();
      setUser(userData);

      const babiesData = await babyAPI.getAll();
      setBabies(Array.isArray(babiesData) ? babiesData : []);

      // Fetch expert articles
      try {
        setLoadingArticles(true);
        const articlesData = await contentAPI.getAll({ status: 'approved' });
        setTips(Array.isArray(articlesData) ? articlesData : []);
      } catch (err) {
        console.error("Failed to fetch articles", err);
      } finally {
        setLoadingArticles(false);
      }

    } catch (error: any) {
      toast.error("Failed to load profile");
    }
  };

  const loadBabySpecificData = async (babyId: string) => {
    try {
      const logs = await healthLogAPI.getAll(babyId);
      setHealthLogs(logs);

      const vax = await vaccinationAPI.getAll(babyId);
      setVaccinations(vax);

      // Check for upcoming vaccines for Alert
      const currentBaby = babies.find(b => b._id === babyId);
      if (currentBaby) {
        const allVaccines = calculateSchedule(currentBaby, vax);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const dueSoon = allVaccines.filter(v => {
          if (v.status === 'completed') return false;
          const due = new Date(v.dueDate);
          // Due in the past (overdue) OR due in next 7 days
          return due <= nextWeek;
        });

        if (dueSoon.length > 0) {
          setUpcomingVaccines(dueSoon);
          // Only show if we haven't shown it this session? Or just show it.
          // For now, let's show it if it's the first load or explicit refresh.
          // To avoid annoyance, maybe check a session flag, but user requirement is "popup on startup".
          setAlertOpen(true);
        }
      }

      // Process growth data
      const dob = currentBaby?.dateOfBirth ? parseISO(currentBaby.dateOfBirth) : new Date();

      const sortedLogs = logs
        .filter((log: any) => log.weight || log.height)
        .sort((a: any, b: any) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime());

      const processedGrowthData = sortedLogs.map((log: any, index: number) => {
        const date = new Date(log.date || log.createdAt);
        const monthsSinceBirth = currentBaby?.dateOfBirth
          ? differenceInMonths(date, dob)
          : index;
        return {
          month: monthsSinceBirth === 0 ? "Birth" : `${monthsSinceBirth}M`,
          weight: log.weight || null,
          height: log.height || null,
          date: date,
        };
      });

      setGrowthData(processedGrowthData);

    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load baby data");
    }
  };

  const onPickBabyPhoto = async (file: File) => {
    if (!selectedBabyId) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });

      await babyAPI.update(selectedBabyId, { avatar: dataUrl });
      // Update local state
      setBabies(prev => prev.map(b => b._id === selectedBabyId ? { ...b, avatar: dataUrl } : b));
      toast.success("Baby photo updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update photo");
    }
  };

  const handleQuickAction = (type: string) => {
    if (!selectedBabyId) {
      toast.error("Please select a baby first");
      return;
    }
    setActiveModal(type);
  };

  const handleBabySwitch = (id: string) => {
    setSelectedBabyId(id);
    localStorage.setItem("selectedBabyId", id);
    setSearchParams({ babyId: id });
  };

  const handleSave = async () => {
    if (!selectedBabyId) return;
    setLoading(true);
    try {
      let dataToSave: any = { babyId: selectedBabyId };
      const currentBaby = babies.find(b => b._id === selectedBabyId);
      if (currentBaby) dataToSave.babyName = currentBaby.name;

      if (activeModal === "feed") {
        dataToSave = {
          ...dataToSave,
          feeding: `${feedData.type}${feedData.amount ? ` - ${feedData.amount}` : ""}${feedData.notes ? ` | ${feedData.notes}` : ""}`,
          notes: feedData.notes || undefined,
        };
      } else if (activeModal === "sleep") {
        dataToSave = {
          ...dataToSave,
          sleepHours: sleepData.hours ? parseFloat(sleepData.hours) : undefined,
          notes: `${sleepData.quality ? `Quality: ${sleepData.quality}` : ""}${sleepData.notes ? ` | ${sleepData.notes}` : ""}`.trim() || undefined,
        };
      } else if (activeModal === "temp") {
        dataToSave = {
          ...dataToSave,
          temperature: tempData.temperature ? parseFloat(tempData.temperature) : undefined,
          notes: tempData.notes || undefined,
        };
      } else if (activeModal === "symptom") {
        dataToSave = {
          ...dataToSave,
          symptoms: `${symptomData.symptom}${symptomData.severity ? ` (${symptomData.severity})` : ""}${symptomData.notes ? ` | ${symptomData.notes}` : ""}`,
          notes: symptomData.notes || undefined,
        };
      }

      await healthLogAPI.create(dataToSave);

      toast.success("Log saved successfully!");
      setActiveModal(null);
      setFeedData({ type: "", amount: "", notes: "" });
      setSleepData({ hours: "", quality: "", notes: "" });
      setTempData({ temperature: "", notes: "" });
      setSymptomData({ symptom: "", severity: "", notes: "" });
      loadBabySpecificData(selectedBabyId);
    } catch (error: any) {
      toast.error(error.message || "Failed to save log");
    } finally {
      setLoading(false);
    }
  };

  const currentBaby = babies.find(b => b._id === selectedBabyId);

  // Calculate baby age
  const getBabyAge = () => {
    if (!currentBaby?.dateOfBirth) return "N/A";
    const months = differenceInMonths(new Date(), parseISO(currentBaby.dateOfBirth));
    if (months === 0) return "Newborn";
    if (months === 1) return "1 month";
    return `${months} months`;
  };

  // Get latest weight and height
  const latestLog = healthLogs
    .filter(log => log.weight || log.height)
    .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())[0];

  const latestWeight = latestLog?.weight || null;
  const latestHeight = latestLog?.height || null;

  // Calculate vaccination progress
  const completedVax = vaccinations.filter(v => v.status === "completed").length;
  const totalVax = vaccinations.length;
  const vaccinationProgress = totalVax > 0 ? Math.round((completedVax / totalVax) * 100) : 0;

  // Get next vaccination
  const nextVaccination = vaccinations
    .filter(v => v.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const maxWeight = growthData.length > 0
    ? Math.max(10, ...growthData.filter(d => d.weight).map(d => d.weight))
    : 10;
  const maxHeight = growthData.length > 0
    ? Math.max(80, ...growthData.filter(d => d.height).map(d => d.height))
    : 80;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <DesktopNav items={navItems} />

      {/* Header with Gradient and Decorative Elements */}
      <header className="relative h-56 md:h-52 md:mt-4 rounded-b-[2.5rem] overflow-hidden" style={{
        background: 'linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)'
      }}>
        {/* Decorative Leaves and Stars (Keep existing styles) */}
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

        {/* Center Content - Baby Photo, Name, and Age */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          {babies.length > 0 ? (
            <>
              <input
                ref={babyPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onPickBabyPhoto(file);
                  if (e.target) e.target.value = "";
                }}
              />
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 p-1 mb-2 relative cursor-pointer group"
                onClick={() => babyPhotoInputRef.current?.click()}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-b from-white/80 to-white/60 flex items-center justify-center overflow-hidden">
                  {currentBaby?.avatar ? (
                    <img src={currentBaby.avatar} alt="Baby" className="w-full h-full object-cover" />
                  ) : (
                    <Baby className="w-10 h-10 md:w-12 md:h-12 text-primary/60" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Add Photo</span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white rounded-full px-4 h-auto py-1 flex items-center gap-2">
                    <span className="text-xl md:text-2xl font-bold">{currentBaby?.name}</span>
                    <ChevronDown size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {babies.map(b => (
                    <DropdownMenuItem key={b._id} onClick={() => handleBabySwitch(b._id)}>
                      {b.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <p className="text-white/90 text-sm font-medium">{getBabyAge()} old</p>
              <p className="text-white/70 text-xs">Happy & Healthy!</p>
            </>
          ) : (
            <div className="text-center text-white">
              <h2 className="text-xl font-bold">Welcome!</h2>
              <p className="mb-2">Please add a baby profile to get started.</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/parent/profile')}>Add Baby</Button>
            </div>
          )}
        </div>
      </header>

      {selectedBabyId && (
        <>
          {/* Quick Actions Card - Overlapping */}
          <div className="px-4 mt-4 max-w-lg mx-auto md:max-w-4xl">
            <Card className="glass-card border-0 shadow-soft animate-slide-up p-4">
              <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.type)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl ${action.color} hover:opacity-80 transition-opacity aspect-square`}
                  >
                    <action.icon size={20} className="text-foreground/80" />
                    <span className="text-[10px] font-medium text-foreground/70 leading-tight text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Daily Health Tip Section - Top Placement */}
          <div className="px-4 mt-4 max-w-lg mx-auto md:max-w-4xl">
            <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 border-teal-100 dark:border-teal-800 shadow-sm p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Leaf size={64} className="text-teal-600" />
              </div>

              <div className="relative z-10 flex gap-4 items-start">
                <div className="bg-white dark:bg-teal-900/50 p-2.5 rounded-full shadow-sm shrink-0">
                  <div className="text-2xl">{dailyTips[new Date().getDate() % dailyTips.length].icon}</div>
                </div>
                <div>
                  <h3 className="font-bold text-teal-900 dark:text-teal-100 text-sm uppercase tracking-wide mb-1">
                    Daily Health Tip: {dailyTips[new Date().getDate() % dailyTips.length].title}
                  </h3>
                  <p className="text-sm text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
                    {dailyTips[new Date().getDate() % dailyTips.length].tip}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Grid for Desktop */}
          <div className="px-4 mt-4 max-w-lg mx-auto md:max-w-4xl md:grid md:grid-cols-2 md:gap-4">
            {/* Growth Chart Card */}
            <Card className="bg-card border-0 shadow-card p-4 mb-4 md:mb-0">
              <h3 className="font-bold text-foreground mb-4">Growth Chart</h3>

              {/* Line Graph Style Chart */}
              <div className="space-y-6">
                {/* Weight Chart */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      Weight
                    </span>
                    <span className="font-semibold text-foreground">{latestWeight ? `${latestWeight} kg` : "N/A"}</span>
                  </div>
                  <div className="relative h-24 bg-muted/30 rounded-xl p-2">
                    <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="15" x2="200" y2="15" stroke="currentColor" strokeOpacity="0.1" />
                      <line x1="0" y1="30" x2="200" y2="30" stroke="currentColor" strokeOpacity="0.1" />
                      <line x1="0" y1="45" x2="200" y2="45" stroke="currentColor" strokeOpacity="0.1" />

                      {/* Line path */}
                      {growthData.filter(d => d.weight).length > 0 && (
                        <>
                          <polyline
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={growthData.filter(d => d.weight).map((d, i, arr) =>
                              `${(i / Math.max(1, arr.length - 1)) * 190 + 5},${55 - (d.weight / maxWeight) * 50}`
                            ).join(' ')}
                          />

                          {/* Data points */}
                          {growthData.filter(d => d.weight).map((d, i, arr) => (
                            <circle
                              key={i}
                              cx={(i / Math.max(1, arr.length - 1)) * 190 + 5}
                              cy={55 - (d.weight / maxWeight) * 50}
                              r="3"
                              fill="hsl(var(--primary))"
                            />
                          ))}
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    {growthData.filter(d => d.weight).length > 0 ? (
                      <>
                        <span>{growthData.filter(d => d.weight)[0]?.month || "Start"}</span>
                        {growthData.filter(d => d.weight).length > 2 && (
                          <span>{growthData.filter(d => d.weight)[Math.floor(growthData.filter(d => d.weight).length / 2)]?.month || ""}</span>
                        )}
                        <span>{growthData.filter(d => d.weight)[growthData.filter(d => d.weight).length - 1]?.month || "Now"}</span>
                      </>
                    ) : (
                      <span className="text-center w-full">No weight data yet</span>
                    )}
                  </div>
                </div>

                {/* Height Chart */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent"></div>
                      Height
                    </span>
                    <span className="font-semibold text-foreground">{latestHeight ? `${latestHeight} cm` : "N/A"}</span>
                  </div>
                  <div className="relative h-24 bg-muted/30 rounded-xl p-2">
                    <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="15" x2="200" y2="15" stroke="currentColor" strokeOpacity="0.1" />
                      <line x1="0" y1="30" x2="200" y2="30" stroke="currentColor" strokeOpacity="0.1" />
                      <line x1="0" y1="45" x2="200" y2="45" stroke="currentColor" strokeOpacity="0.1" />

                      {/* Line path */}
                      {growthData.filter(d => d.height).length > 0 && (
                        <>
                          <polyline
                            fill="none"
                            stroke="hsl(var(--accent))"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={growthData.filter(d => d.height).map((d, i, arr) =>
                              `${(i / Math.max(1, arr.length - 1)) * 190 + 5},${55 - (d.height / maxHeight) * 50}`
                            ).join(' ')}
                          />

                          {/* Data points */}
                          {growthData.filter(d => d.height).map((d, i, arr) => (
                            <circle
                              key={i}
                              cx={(i / Math.max(1, arr.length - 1)) * 190 + 5}
                              cy={55 - (d.height / maxHeight) * 50}
                              r="3"
                              fill="hsl(var(--accent))"
                            />
                          ))}
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    {growthData.filter(d => d.height).length > 0 ? (
                      <>
                        <span>{growthData.filter(d => d.height)[0]?.month || "Start"}</span>
                        {growthData.filter(d => d.height).length > 2 && (
                          <span>{growthData.filter(d => d.height)[Math.floor(growthData.filter(d => d.height).length / 2)]?.month || ""}</span>
                        )}
                        <span>{growthData.filter(d => d.height)[growthData.filter(d => d.height).length - 1]?.month || "Now"}</span>
                      </>
                    ) : (
                      <span className="text-center w-full">No height data yet</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Vaccination Schedule Card - Clickable */}
            <Card
              className="bg-card border-0 shadow-card p-4 cursor-pointer hover:shadow-lg transition-shadow mb-4 md:mb-0"
              onClick={() => navigate("/parent/vaccination")}
            >
              <h3 className="font-bold text-foreground mb-3">Vaccination Schedule</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-foreground">{vaccinationProgress}%</span>
                </div>
                <Progress value={vaccinationProgress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <span>Completed: {completedVax}</span>
                  <span>Remaining: {totalVax - completedVax}</span>
                </div>
                <p className="text-xs text-primary mt-2">
                  {nextVaccination
                    ? `Next: ${format(new Date(nextVaccination.dueDate), "MMM d, yyyy")}`
                    : "All vaccinations up to date!"}
                </p>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Quick Access Cards */}
      <div className="px-4 mt-4 max-w-lg mx-auto md:max-w-4xl">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">QUICK ACCESS</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            icon={User}
            title="Profile"
            description="View and manage baby & parent info"
            to="/parent/profile"
          />
          <DashboardCard
            icon={HeartPulse}
            title="Health Log"
            description="Track weight, temperature & more"
            to="/parent/health-log"
          />
          <DashboardCard
            icon={MessageCircleQuestion}
            title="Query & Response"
            description="Ask chatbot or consult a doctor"
            to="/parent/query"
          />
          <DashboardCard
            icon={Syringe}
            title="Vaccination"
            description="View schedule and reminders"
            to="/parent/vaccination"
          />
          <DashboardCard
            icon={FileBarChart}
            title="Reports & Alerts"
            description="Growth reports and health alerts"
            to="/parent/reports"
          />
        </div>


        {/* Expert Articles Section - Premium Grid Design */}
        <div className="mt-6 mb-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Expert Insights
            </h3>
            <Button variant="link" size="sm" className="text-primary p-0 h-auto" onClick={() => navigate('/parent/query')}>
              View All
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {loadingArticles && <p className="text-sm text-muted-foreground italic col-span-full text-center py-8">Loading expert advice...</p>}
            {!loadingArticles && tips.length === 0 && <p className="text-sm text-muted-foreground italic col-span-full text-center py-8">No articles available.</p>}
            {!loadingArticles && tips.map((tip) => (
              <Card
                key={tip._id}
                className="bg-card border-0 shadow-soft hover:shadow-card-hover transition-all duration-300 group cursor-pointer overflow-hidden relative"
                onClick={() => navigate(`/parent/content/${tip._id}`)}
              >
                {/* Decorative Gradient Background Opacity */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-5 relative z-10">
                  <div className="flex items-start gap-4">
                    {/* Icon Container */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <BookOpen className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Category Badge (Mock logic for now, or derived from title) */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600/80 bg-blue-50 px-2 py-0.5 rounded-full">
                          Health Tips
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> 3 min read
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {tip.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-border/50">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-muted overflow-hidden">
                            {tip.practitionerId?.avatar ? (
                              <img src={tip.practitionerId.avatar} className="w-full h-full object-cover" />
                            ) : (
                              <User size={12} className="text-muted-foreground m-auto" />
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {tip.practitionerId?.fullName || "Nino Expert"}
                          </span>
                        </div>
                        <div className="flex items-center text-primary text-[11px] font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          Read Article <ArrowRight size={12} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Modal */}
      <Dialog open={activeModal === "feed"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-peach-foreground" />
              Log Feeding
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Feed Type</Label>
              <Input
                placeholder="e.g., Breastmilk, Formula, Solids"
                value={feedData.type}
                onChange={(e) => setFeedData({ ...feedData, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                placeholder="e.g., 150ml or 1 serving"
                value={feedData.amount}
                onChange={(e) => setFeedData({ ...feedData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional notes..."
                value={feedData.notes}
                onChange={(e) => setFeedData({ ...feedData, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Feed Log"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sleep Modal */}
      <Dialog open={activeModal === "sleep"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-secondary-foreground" />
              Log Sleep
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hours Slept</Label>
              <Input
                type="number"
                placeholder="e.g., 8"
                value={sleepData.hours}
                onChange={(e) => setSleepData({ ...sleepData, hours: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sleep Quality</Label>
              <Input
                placeholder="e.g., Good, Restless, Deep"
                value={sleepData.quality}
                onChange={(e) => setSleepData({ ...sleepData, quality: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional notes..."
                value={sleepData.notes}
                onChange={(e) => setSleepData({ ...sleepData, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Sleep Log"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Temperature Modal */}
      <Dialog open={activeModal === "temp"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-accent-foreground" />
              Log Temperature
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Temperature (°C)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 36.8"
                value={tempData.temperature}
                onChange={(e) => setTempData({ ...tempData, temperature: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional notes..."
                value={tempData.notes}
                onChange={(e) => setTempData({ ...tempData, notes: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Temperature Log"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Vaccine Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-primary">
              <Syringe className="w-5 h-5" />
              Vaccination Reminder
            </AlertDialogTitle>
            <AlertDialogDescription>
              The following vaccinations are due soon or overdue for {currentBaby?.name}:
              <ul className="mt-3 space-y-2 max-h-[60vh] overflow-y-auto">
                {upcomingVaccines.map((v, i) => (
                  <li key={i} className="bg-muted/50 p-2 rounded-lg flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground">{v.name}</span>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                      new Date(v.dueDate) < new Date() ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                    )}>
                      {new Date(v.dueDate) < new Date() ? "Overdue" : `Due ${format(new Date(v.dueDate), "MMM d")}`}
                    </span>
                  </li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setAlertOpen(false);
              navigate("/parent/vaccination");
            }}>
              View Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Symptom Modal */}
      <Dialog open={activeModal === "symptom"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-mint-foreground" />
              Add Symptom
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Symptom</Label>
              <Input
                placeholder="e.g., Cough, Runny nose, Fever"
                value={symptomData.symptom}
                onChange={(e) => setSymptomData({ ...symptomData, symptom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Input
                placeholder="e.g., Mild, Moderate, Severe"
                value={symptomData.severity}
                onChange={(e) => setSymptomData({ ...symptomData, severity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional notes..."
                value={symptomData.notes}
                onChange={(e) => setSymptomData({ ...symptomData, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Symptom"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav items={navItems} />
    </div >
  );
};

export default ParentDashboard;
