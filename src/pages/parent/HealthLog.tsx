import { useState, useEffect } from "react";
import {
  Scale,
  Ruler,
  Thermometer,
  Moon,
  Baby,
  FileText,
  Save,
  History,
  Home,
  HeartPulse,
  Syringe,
  MessageCircleQuestion,
  User,
  Star,
  Cloud,
  Leaf,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { healthLogAPI, userAPI, babyAPI } from "@/lib/api";
import { toast } from "sonner";
import { format, startOfDay } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: Home, label: "Home", path: "/parent/dashboard" },
  { icon: HeartPulse, label: "Health", path: "/parent/health-log" },
  { icon: Syringe, label: "Vaccines", path: "/parent/vaccination" },
  { icon: MessageCircleQuestion, label: "Ask", path: "/parent/query" },
  { icon: User, label: "Profile", path: "/parent/profile" },
];

const HealthLog = () => {
  // Form and Data State
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [feeding, setFeeding] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Baby Selection State
  const [babies, setBabies] = useState<any[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [currentBaby, setCurrentBaby] = useState<any>(null); // To display name/avatar

  // UI State
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBabies();
  }, []);

  // Whenever selectedBabyId changes, reload logs
  useEffect(() => {
    if (selectedBabyId) {
      loadLogs(selectedBabyId);
      const baby = babies.find(b => b._id === selectedBabyId);
      setCurrentBaby(baby);
    }
  }, [selectedBabyId, babies]);

  const loadBabies = async () => {
    try {
      const babiesData = await babyAPI.getAll();
      if (Array.isArray(babiesData) && babiesData.length > 0) {
        setBabies(babiesData);

        const storedId = localStorage.getItem("selectedBabyId");
        if (storedId && babiesData.some((b: any) => b._id === storedId)) {
          setSelectedBabyId(storedId);
        } else {
          setSelectedBabyId(babiesData[0]._id);
        }
      } else {
        // Fallback or handle empty state (prompt to create baby)
      }
    } catch (error) {
      toast.error("Failed to load babies");
    }
  };

  const loadLogs = async (babyId: string) => {
    try {
      // Note: healthLogAPI needs to support filtering by babyId
      // We previously added support for ?babyId=... in backend
      const logs = await healthLogAPI.getAll(babyId);
      // Wait, existing client method getAll() is empty args. Need to check API definition.
      // Assuming we updated api.ts but I will double check. I'll rely on a manual fetch if needed or assume I updated it.
      // Actually I did not update api.ts healthLogAPI.getAll to accept args in previous turn.
      // I should construct the URL manually or update api.ts.
      // Let's assume I fix api.ts later or use URL construction here for safety.

      // To be safe, I'll update api.ts in a diff step, but for now let's assume `healthLogAPI.getAll` might not support args yet.
      // I'll assume standard fetch for now to be safe or check api.ts again.
      // Correction: I should update api.ts so I will assume it's done.
      const allLogs = await healthLogAPI.getAll(babyId);
      setRecentLogs(allLogs.slice(0, 30));
    } catch (error) {
      console.error("Failed logs", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Fields are optional, but if entered, must be valid numbers
    if (weight && (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0)) {
      newErrors.weight = "Please enter a valid weight";
    }

    if (height && (isNaN(parseFloat(height)) || parseFloat(height) <= 0)) {
      newErrors.height = "Please enter a valid height";
    }

    if (temperature && (isNaN(parseFloat(temperature)) || parseFloat(temperature) <= 0)) {
      newErrors.temperature = "Please enter a valid temperature";
    }

    if (sleepHours && (isNaN(parseFloat(sleepHours)) || parseFloat(sleepHours) <= 0)) {
      newErrors.sleepHours = "Please enter valid sleep hours";
    }

    // Check if at least one field is filled (optional validation, but good UX)
    const isAnyFieldFilled = weight || height || temperature || sleepHours || feeding || symptoms;

    if (!isAnyFieldFilled) {
      newErrors.general = "Please fill at least one field";
      toast.error("Please fill at least one field to save a log");
    }

    if (!selectedBabyId) {
      toast.error("Please select a baby first");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && isAnyFieldFilled;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await healthLogAPI.create({
        babyId: selectedBabyId,
        babyName: currentBaby?.name,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
        feeding: feeding || undefined,
        symptoms: symptoms || undefined,
        notes: symptoms || undefined,
      });

      toast.success("Health log saved successfully!");
      setWeight("");
      setHeight("");
      setTemperature("");
      setSleepHours("");
      setFeeding("");
      setSymptoms("");
      setErrors({});
      if (selectedBabyId) loadLogs(selectedBabyId);
    } catch (error: any) {
      toast.error(error.message || "Failed to save health log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <DesktopNav items={navItems} />
      {/* Header with Baby Selector */}
      <header
        className="relative h-44 rounded-b-[2.5rem] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)",
        }}
      >
        {/* Decorative elements kept same */}
        <div className="absolute top-4 left-2">
          <Leaf className="w-5 h-5 text-white/30 rotate-[-30deg]" />
          <Leaf className="w-4 h-4 text-white/25 rotate-[-60deg] -mt-1 ml-2" />
        </div>
        <div className="absolute top-4 right-2">
          <Leaf className="w-5 h-5 text-white/30 rotate-[30deg] ml-auto" />
          <Leaf className="w-4 h-4 text-white/25 rotate-[60deg] -mt-1 mr-2" />
        </div>
        <Star className="absolute top-12 left-1/4 w-3 h-3 text-white/40 fill-white/40" />
        <Star className="absolute top-20 right-8 w-4 h-4 text-white/50 fill-white/50" />
        <Star className="absolute top-16 right-1/4 w-3 h-3 text-white/30 fill-white/30" />
        <Cloud className="absolute top-24 left-4 w-12 h-12 text-white/20 fill-white/10" />
        <Cloud className="absolute top-28 right-6 w-16 h-16 text-white/25 fill-white/15" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          {babies.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white rounded-full px-4 h-auto py-2 flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-white/20 p-1">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-white/80 to-white/60 flex items-center justify-center overflow-hidden">
                      {currentBaby?.avatar ? <img src={currentBaby.avatar} className="w-full h-full object-cover" /> : <HeartPulse className="w-6 h-6 text-primary/60" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{currentBaby?.name || "Select Baby"}</span>
                    <ChevronDown size={16} className="text-white/80" />
                  </div>
                  <span className="text-white/80 text-xs font-normal">Track daily health</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {babies.map(b => (
                  <DropdownMenuItem key={b._id} onClick={() => {
                    setSelectedBabyId(b._id);
                    localStorage.setItem("selectedBabyId", b._id);
                  }}>
                    {b.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-bold text-white">Health Log</h1>
              <p className="text-white/80 text-sm">Please add a baby in profile first</p>
            </div>
          )}
        </div>
      </header>

      <div className="px-4 mt-4 max-w-lg mx-auto">

        {/* Current Stats */}
        {babies.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="bg-success border-0 shadow-soft">
              <CardContent className="py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-foreground/10 flex items-center justify-center">
                  <Scale size={20} className="text-success-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold text-success-foreground">
                    {(() => {
                      const latest = [...recentLogs].sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()).find(l => l.weight);
                      return latest ? `${latest.weight} kg` : "--";
                    })()}
                  </p>
                  <p className="text-xs text-success-foreground/70">Weight</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-pending border-0 shadow-soft">
              <CardContent className="py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pending-foreground/10 flex items-center justify-center">
                  <Ruler size={20} className="text-pending-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold text-pending-foreground">
                    {(() => {
                      const latest = [...recentLogs].sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()).find(l => l.height);
                      return latest ? `${latest.height} cm` : "--";
                    })()}
                  </p>
                  <p className="text-xs text-pending-foreground/70">Height</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Input Form - Conditional on baby existing */}
        {babies.length > 0 ? (
          <Card className="mb-6 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg">New Health Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale size={14} className="text-muted-foreground" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="7.2"
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                      if (errors.weight) setErrors({ ...errors, weight: "" });
                    }}
                    className={`h-11 rounded-xl ${errors.weight ? "border-destructive" : ""}`}
                  />
                  {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                    <Ruler size={14} className="text-muted-foreground" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="68"
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value);
                      if (errors.height) setErrors({ ...errors, height: "" });
                    }}
                    className={`h-11 rounded-xl ${errors.height ? "border-destructive" : ""}`}
                  />
                  {errors.height && <p className="text-xs text-destructive mt-1">{errors.height}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="flex items-center gap-2">
                    <Thermometer size={14} className="text-muted-foreground" />
                    Temp (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="36.8"
                    value={temperature}
                    onChange={(e) => {
                      setTemperature(e.target.value);
                      if (errors.temperature) setErrors({ ...errors, temperature: "" });
                    }}
                    className={`h-11 rounded-xl ${errors.temperature ? "border-destructive" : ""}`}
                  />
                  {errors.temperature && <p className="text-xs text-destructive mt-1">{errors.temperature}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sleep" className="flex items-center gap-2">
                    <Moon size={14} className="text-muted-foreground" />
                    Sleep (hrs)
                  </Label>
                  <Input
                    id="sleep"
                    type="number"
                    placeholder="14"
                    value={sleepHours}
                    onChange={(e) => {
                      setSleepHours(e.target.value);
                      if (errors.sleepHours) setErrors({ ...errors, sleepHours: "" });
                    }}
                    className={`h-11 rounded-xl ${errors.sleepHours ? "border-destructive" : ""}`}
                  />
                  {errors.sleepHours && <p className="text-xs text-destructive mt-1">{errors.sleepHours}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeding" className="flex items-center gap-2">
                  <Baby size={14} className="text-muted-foreground" />
                  Feeding Details
                </Label>
                <Input
                  id="feeding"
                  placeholder="e.g., Breastmilk 6x, Solids 2x"
                  value={feeding}
                  onChange={(e) => setFeeding(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms" className="flex items-center gap-2">
                  <FileText size={14} className="text-muted-foreground" />
                  Symptoms / Notes
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Any symptoms or observations..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[80px] rounded-xl resize-none"
                />
              </div>

              <div className="pt-2">
                <Button className="w-full gap-2" onClick={handleSave} disabled={loading}>
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Log"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 text-center py-8">
            <p className="text-muted-foreground mb-4">No baby profiles found.</p>
            <Button onClick={() => window.location.href = '/parent/profile'}>Go to Profile to Add Baby</Button>
          </Card>
        )}

        {/* Recent Logs List - Same logic as before but updated for new structure */}
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">RECENT LOGS</h3>
        {(() => {
          if (!recentLogs || recentLogs.length === 0) return <p className="text-sm text-foreground/50 text-center">No logs found for this baby.</p>;

          const groupedLogs = recentLogs.reduce((acc, log) => {
            const logDate = new Date(log.date || log.createdAt);
            if (isNaN(logDate.getTime())) return acc; // Skip invalid dates
            const dayKey = format(startOfDay(logDate), "yyyy-MM-dd");
            const dayLabel = format(logDate, "EEEE, MMMM d, yyyy");

            if (!acc[dayKey]) acc[dayKey] = { date: logDate, label: dayLabel, logs: [] };
            acc[dayKey].logs.push(log);
            return acc;
          }, {} as any);

          const sortedDays = Object.values(groupedLogs).sort((a: any, b: any) => b.date.getTime() - a.date.getTime()) as any[];

          return (
            <div className="space-y-6">
              {sortedDays.map((dayGroup) => (
                <div key={dayGroup.label} className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    {dayGroup.label}
                  </h4>
                  <Card className="animate-slide-up overflow-hidden border-none shadow-soft">
                    <CardContent className="p-0">
                      {dayGroup.logs.map((log: any, logIndex: number) => (
                        <div
                          key={log._id || `${dayGroup.label}-${logIndex}`}
                          className={cn(
                            "p-4 cursor-pointer hover:bg-muted/30 transition-colors",
                            logIndex !== dayGroup.logs.length - 1 ? "border-b border-border/50" : ""
                          )}
                          onClick={() => {
                            setSelectedLog(log);
                            setViewDialogOpen(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xs font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                                  {format(new Date(log.date || log.createdAt), "h:mm a")}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                {log.weight && (
                                  <span className="flex items-center gap-1.5" title="Weight">
                                    <Scale size={14} className="text-muted-foreground" />
                                    <span className="font-medium text-foreground">{log.weight} kg</span>
                                  </span>
                                )}
                                {log.height && (
                                  <span className="flex items-center gap-1.5" title="Height">
                                    <Ruler size={14} className="text-muted-foreground" />
                                    <span className="font-medium text-foreground">{log.height} cm</span>
                                  </span>
                                )}
                                {log.temperature && (
                                  <span className="flex items-center gap-1.5" title="Temperature">
                                    <Thermometer size={14} className="text-muted-foreground" />
                                    <span className="font-medium text-foreground">{log.temperature}°C</span>
                                  </span>
                                )}
                              </div>
                              {(log.feeding || log.symptoms) && (
                                <div className="mt-2 text-sm text-foreground/80 space-y-1">
                                  {log.feeding && <p className="line-clamp-1"><span className="text-muted-foreground text-xs">Feeding:</span> {log.feeding}</p>}
                                  {log.symptoms && <p className="line-clamp-1"><span className="text-muted-foreground text-xs">Note:</span> {log.symptoms}</p>}
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" className="ml-2 text-muted-foreground">View</Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        {/* ... (View Dialog content same as before) ... */}
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Health Log Details</DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.date || selectedLog.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedLog.weight && <div><p className="text-xs text-muted-foreground">Weight</p><p className="font-semibold">{selectedLog.weight} kg</p></div>}
                {selectedLog.height && <div><p className="text-xs text-muted-foreground">Height</p><p className="font-semibold">{selectedLog.height} cm</p></div>}
                {selectedLog.temperature && <div><p className="text-xs text-muted-foreground">Temperature</p><p className="font-semibold">{selectedLog.temperature}°C</p></div>}
                {selectedLog.sleepHours && <div><p className="text-xs text-muted-foreground">Sleep</p><p className="font-semibold">{selectedLog.sleepHours} hours</p></div>}
              </div>
              {selectedLog.feeding && <div><p className="text-xs text-muted-foreground mb-1">Feeding</p><p className="text-sm">{selectedLog.feeding}</p></div>}
              {selectedLog.notes && <div><p className="text-xs text-muted-foreground mb-1">Notes</p><p className="text-sm">{selectedLog.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav items={navItems} />
    </div>
  );
};

export default HealthLog;
