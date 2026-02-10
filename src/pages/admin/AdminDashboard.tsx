import { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Star,
  Cloud,
  Leaf,
  Home,
  User,
  LogOut,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  Syringe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { StatusBadge } from "@/components/StatusBadge";
import { adminAPI, authAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const navItems = [
  { icon: Home, label: "Admin", path: "/admin/dashboard" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: FileText, label: "Articles", path: "/admin/content" },
  { icon: Syringe, label: "Vaccines", path: "/admin/vaccines" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userStatus, setUserStatus] = useState("all");

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      navigate("/login");
    }
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const pData = await adminAPI.getPractitioners();
      setPractitioners(pData);
    } catch (error: any) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (id: string, status: 'verified' | 'rejected' | 'pending') => {
    try {
      await adminAPI.verifyPractitioner(id, status);
      toast.success(`User marked as ${status}`);
      loadAllData();
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const handleDeletePractitioner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this practitioner account? This action cannot be undone.")) return;
    try {
      await adminAPI.deletePractitioner(id);
      toast.success("Practitioner deleted");
      loadAllData();
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  // Filtered Lists
  const filteredUsers = useMemo(() => {
    return practitioners.filter(p => {
      const name = p.fullName || "";
      const spec = p.specialization || "";
      const matchesSearch = name.toLowerCase().includes(userSearch.toLowerCase()) ||
        spec.toLowerCase().includes(userSearch.toLowerCase());
      const matchesStatus = userStatus === "all" || p.verificationStatus === userStatus;
      return matchesSearch && matchesStatus;
    });
  }, [practitioners, userSearch, userStatus]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <DesktopNav items={navItems} />

      {/* Header */}
      <header
        className="relative h-44 rounded-b-[2.5rem] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)",
        }}
      >
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
        <Cloud className="absolute top-24 left-4 w-12 h-12 text-white/20 fill-white/10" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 text-white">
          <ShieldCheck size={48} className="mb-2 text-white/80" />
          <h1 className="text-2xl font-bold uppercase tracking-widest">Admin Control</h1>
          <p className="text-white/70 text-sm">Practitioner Verification</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={handleLogout}
        >
          <LogOut size={20} />
        </Button>
      </header>

      <div className="px-4 mt-6 max-w-lg mx-auto md:max-w-4xl">
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Practitioner Registry</h2>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search name or specialty..."
                className="pl-9 h-10 rounded-xl"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <Select value={userStatus} onValueChange={setUserStatus}>
              <SelectTrigger className="w-full md:w-[180px] h-10 rounded-xl bg-card">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3 text-muted-foreground" />
                  <SelectValue placeholder="All Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground animate-pulse">Loading registry...</div>
          ) : (
            <>
              {filteredUsers.length === 0 && (
                <p className="text-center py-12 text-muted-foreground">No practitioners match your filters.</p>
              )}

              <div className="space-y-3">
                {filteredUsers.map((p) => (
                  <Card key={p._id} className="overflow-hidden border-0 shadow-soft">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border">
                          {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" /> : <User className="text-primary/60" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground truncate">{p.fullName}</h3>
                          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider truncate">{p.specialization || "Generalist"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">License: {p.licenseNumber || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end shrink-0">
                        <div className="flex items-center gap-2">
                          {p.verificationStatus === 'verified' && <StatusBadge status="completed" className="bg-success/20 text-success border-success/30" />}
                          {p.verificationStatus === 'rejected' && <StatusBadge status="rejected" />}
                          {p.verificationStatus === 'pending' && <StatusBadge status="pending" />}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeletePractitioner(p._id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>

                        <div className="flex gap-1">
                          {p.verificationStatus !== 'verified' && (
                            <Button size="sm" className="h-7 px-2 text-[10px] bg-success hover:bg-success/90" onClick={() => handleUpdateUserStatus(p._id, 'verified')}>
                              Approve
                            </Button>
                          )}
                          {p.verificationStatus !== 'rejected' && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10" onClick={() => handleUpdateUserStatus(p._id, 'rejected')}>
                              Reject
                            </Button>
                          )}
                          {p.verificationStatus !== 'pending' && (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => handleUpdateUserStatus(p._id, 'pending')}>Reset</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
};

export default AdminDashboard;
