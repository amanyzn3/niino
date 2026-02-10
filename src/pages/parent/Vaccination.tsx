import { useState, useEffect } from "react";
import {
  Syringe,
  Calendar,
  Check,
  Clock,
  Plus,
  Bell,
  Home,
  HeartPulse,
  MessageCircleQuestion,
  User,
  Star,
  Cloud,
  Leaf,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { vaccinationAPI, userAPI, babyAPI } from "@/lib/api";
import { toast } from "sonner";
import { format, isPast, isToday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateSchedule } from "@/lib/vaccineSchedule";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


const navItems = [
  { icon: Home, label: "Home", path: "/parent/dashboard" },
  { icon: HeartPulse, label: "Health", path: "/parent/health-log" },
  { icon: Syringe, label: "Vaccines", path: "/parent/vaccination" },
  { icon: MessageCircleQuestion, label: "Ask", path: "/parent/query" },
  { icon: User, label: "Profile", path: "/parent/profile" },
];

const Vaccination = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [babies, setBabies] = useState<any[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [vaccineToComplete, setVaccineToComplete] = useState<any>(null);


  // Add Vaccine Form
  const [newVaccine, setNewVaccine] = useState({ name: "", dueDate: "", description: "" });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBabyId) {
      loadVaccines(selectedBabyId);
    }
  }, [selectedBabyId]);

  const loadData = async () => {
    try {
      const userData = await userAPI.getProfile();
      setUser(userData);

      const babiesData = await babyAPI.getAll();
      setBabies(Array.isArray(babiesData) ? babiesData : []);

      if (Array.isArray(babiesData) && babiesData.length > 0) {
        const storedId = localStorage.getItem("selectedBabyId");
        if (storedId && babiesData.some((b: any) => b._id === storedId)) {
          setSelectedBabyId(storedId);
        } else {
          setSelectedBabyId(babiesData[0]._id);
        }
      }
    } catch (error: any) {
      toast.error("Failed to load data");
    }
  };

  const loadVaccines = async (babyId: string) => {
    try {
      const data = await vaccinationAPI.getAll(babyId);
      setVaccines(data);
    } catch (e) {
      console.error(e);
    }
  };

  const currentBaby = babies.find(b => b._id === selectedBabyId);

  const [mergedVaccines, setMergedVaccines] = useState<any[]>([]);

  // Standard Schedule Definition (IAP)
  // Standard Schedule Definition (IAP)
  useEffect(() => {
    const fetchSchedule = async () => {
      if (selectedBabyId && babies.length > 0) {
        const baby = babies.find(b => b._id === selectedBabyId);
        if (baby) {
          // Use shared utility
          const merged = await calculateSchedule(baby, vaccines);
          setMergedVaccines(merged);
        }
      }
    };
    fetchSchedule();
  }, [selectedBabyId, vaccines, babies]);


  const initiateMarkComplete = (vaccine: any) => {
    const today = new Date();
    const dueDate = new Date(vaccine.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If more than 14 days early, warn user
    if (diffDays > 14) {
      setVaccineToComplete(vaccine);
      setValidationDialogOpen(true);
    } else {
      // Proceed directly
      handleMarkComplete(vaccine);
    }
  };

  const handleMarkComplete = async (vaccine: any = vaccineToComplete) => {
    if (!vaccine) return;

    setLoading(true);
    try {
      if (vaccine.isPredicted) {
        // Create new record
        await vaccinationAPI.create({
          babyId: selectedBabyId,
          babyName: currentBaby?.name,
          name: vaccine.name,
          dueDate: vaccine.dueDate,
          status: "completed",
          completedDate: new Date().toISOString()
        });
      } else {
        // Update existing
        await vaccinationAPI.update(vaccine._id, {
          status: "completed",
          completedDate: new Date().toISOString(),
        });
      }

      toast.success("Vaccination marked as complete");
      if (selectedBabyId) loadVaccines(selectedBabyId);
    } catch (error: any) {
      toast.error(error.message || "Failed to update vaccination");
    } finally {
      setLoading(false);
      setValidationDialogOpen(false);
      setVaccineToComplete(null);
    }
  };

  const handleAddVaccine = async () => {
    if (!selectedBabyId) return;
    if (!newVaccine.name || !newVaccine.dueDate) {
      toast.error("Name and Due Date are required");
      return;
    }
    try {
      await vaccinationAPI.create({
        babyId: selectedBabyId,
        babyName: currentBaby?.name,
        name: newVaccine.name,
        dueDate: newVaccine.dueDate,
        description: newVaccine.description,
        status: "pending"
      });
      toast.success("Vaccination added");
      setAddDialogOpen(false);
      setNewVaccine({ name: "", dueDate: "", description: "" });
      loadVaccines(selectedBabyId);
    } catch (e) {
      toast.error("Failed to add vaccination");
    }
  };

  const filteredVaccines = mergedVaccines.filter((v) => {
    if (filter === "all") return true;
    if (filter === "pending") return v.status === "pending" || v.status === "overdue"; // Group overdue with pending often
    return v.status === filter;
  });

  const pendingCount = mergedVaccines.filter((v) => v.status === "pending" || v.status === "overdue").length;
  const completedCount = mergedVaccines.filter((v) => v.status === "completed").length;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <DesktopNav items={navItems} />
      {/* Decorative Header */}
      <header
        className="relative h-44 rounded-b-[2.5rem] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)",
        }}
      >
        {/* Decorative elements */}
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
                      {currentBaby?.avatar ? <img src={currentBaby.avatar} className="w-full h-full object-cover" /> : <Syringe className="w-6 h-6 text-primary/60" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{currentBaby?.name || "Vaccination"}</span>
                    <ChevronDown size={16} className="text-white/80" />
                  </div>
                  <span className="text-white/80 text-xs font-normal">Immunization Schedule</span>
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
              <h1 className="text-xl font-bold text-white">Vaccination</h1>
              <p className="text-white/80 text-sm">Please add a baby profile</p>
            </div>
          )}
        </div>

        <Button size="sm" className="absolute top-4 right-4 gap-2 bg-white/20 hover:bg-white/30 border-0" onClick={() => setAddDialogOpen(true)}>
          <Plus size={16} />
          Add
        </Button>
      </header>

      <div className="px-4 mt-4 max-w-lg mx-auto">
        {selectedBabyId && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="bg-pending border-0 shadow-soft">
                <CardContent className="py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pending-foreground/10 flex items-center justify-center">
                    <Clock size={20} className="text-pending-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-pending-foreground">{pendingCount}</p>
                    <p className="text-xs text-pending-foreground/70">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-success border-0 shadow-soft">
                <CardContent className="py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-foreground/10 flex items-center justify-center">
                    <Check size={20} className="text-success-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success-foreground">{completedCount}</p>
                    <p className="text-xs text-success-foreground/70">Completed</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
              {(["all", "pending", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Vaccine List */}
            <div className="space-y-3">
              {filteredVaccines.length === 0 ? (
                <Card>
                  <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground text-center">No vaccinations found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredVaccines.map((vaccine, index) => (
                  <Card
                    key={vaccine._id || index}
                    className={`animate-slide-up ${vaccine.status === 'overdue' ? 'border-l-4 border-l-red-500' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="py-4">
                      {/* Age Category Badge */}
                      <div className="mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {vaccine.ageCategory || "Scheduled"}
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            vaccine.status === "completed"
                              ? "bg-success"
                              : (vaccine.status === "overdue" || vaccine.status === "pending") ? "bg-red-100" : "bg-primary/10"
                          )}
                        >
                          <Syringe
                            size={22}
                            className={
                              vaccine.status === "completed"
                                ? "text-success-foreground"
                                : (vaccine.status === "overdue" || vaccine.status === "pending") ? "text-red-600" : "text-primary"
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground">{vaccine.name}</h3>
                            <StatusBadge status={vaccine.status} className={vaccine.status === 'pending' ? "bg-red-100 text-red-700" : ""} />
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {vaccine.description}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-sm">
                            <Calendar size={14} className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {vaccine.status === "completed" && vaccine.completedDate
                                ? `Completed: ${format(new Date(vaccine.completedDate), "MMM d, yyyy")}`
                                : `Due: ${format(new Date(vaccine.dueDate), "MMM d, yyyy")}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      {vaccine.status !== "completed" && (
                        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                          <Button
                            size="sm"
                            variant={vaccine.status === "overdue" ? "destructive" : "success"}
                            className="flex-1 gap-2"
                            onClick={() => initiateMarkComplete(vaccine)}
                            disabled={loading}
                          >
                            <Check size={14} />
                            Mark Complete
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-2">
                            <Bell size={14} />
                            Remind
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vaccination</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vaccine Name</Label>
              <Input value={newVaccine.name} onChange={e => setNewVaccine(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Polio Dose 1" />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={newVaccine.dueDate} onChange={e => setNewVaccine(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input value={newVaccine.description} onChange={e => setNewVaccine(p => ({ ...p, description: e.target.value }))} />
            </div>


            <Button onClick={handleAddVaccine} className="w-full">Add Vaccine</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Validation Warning</AlertDialogTitle>
            <AlertDialogDescription>
              This vaccine is not due until {vaccineToComplete && format(new Date(vaccineToComplete.dueDate), "MMM d, yyyy")}.
              Are you sure you want to mark it as complete so early?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVaccineToComplete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleMarkComplete(vaccineToComplete)}>Yes, Mark Complete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <BottomNav items={navItems} />
    </div>
  );
};

export default Vaccination;
