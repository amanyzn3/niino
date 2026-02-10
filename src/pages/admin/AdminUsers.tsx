import { useEffect, useState, useMemo } from "react";
import {
    Users,
    Baby,
    Search,
    Filter,
    LogOut,
    Home,
    MessageCircle,
    FileText,
    User,
    Phone,
    Mail,
    Calendar,
    ShieldCheck,
    Star,
    Cloud,
    Leaf,
    ChevronRight,
    Syringe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { StatusBadge } from "@/components/StatusBadge";
import { adminAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { format } from "date-fns";

const navItems = [
    { icon: Home, label: "Admin", path: "/admin/dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: FileText, label: "Articles", path: "/admin/content" },
    { icon: Syringe, label: "Vaccines", path: "/admin/vaccines" },
];

const AdminUsers = () => {
    const navigate = useNavigate();
    const [detailedUsers, setDetailedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [genderFilter, setGenderFilter] = useState("all");
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const user = authAPI.getCurrentUser();
        if (user && user.role === 'admin') {
            setCurrentUser(user);
        } else {
            navigate("/login");
        }
        loadDetailedUsers();
    }, [navigate]);

    const loadDetailedUsers = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getDetailedUsers();
            setDetailedUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load user data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        navigate("/login");
    };

    const filteredData = useMemo(() => {
        return detailedUsers.filter(item => {
            const babyName = item.name || "";
            const parentName = item.parentId?.fullName || "";
            const matchesSearch = babyName.toLowerCase().includes(search.toLowerCase()) ||
                parentName.toLowerCase().includes(search.toLowerCase());
            const matchesGender = genderFilter === "all" || item.gender === genderFilter;
            return matchesSearch && matchesGender;
        });
    }, [detailedUsers, search, genderFilter]);

    const stats = useMemo(() => {
        return {
            totalBabies: detailedUsers.length,
            totalParents: new Set(detailedUsers.map(b => b.parentId?._id)).size
        };
    }, [detailedUsers]);

    if (!currentUser) return null;

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
                    <Users size={48} className="mb-2 text-white/80" />
                    <h1 className="text-2xl font-bold uppercase tracking-widest">User Directory</h1>
                    <p className="text-white/70 text-sm">Managing {stats.totalBabies} Active Baby Profiles</p>
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
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search babies or parents..."
                            className="pl-10 h-12 rounded-2xl border-0 shadow-soft"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                        <SelectTrigger className="w-full md:w-[180px] h-12 rounded-2xl bg-card border-0 shadow-soft">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3 h-3 text-muted-foreground" />
                                <SelectValue placeholder="All Genders" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Genders</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-muted-foreground animate-pulse">
                        Fetching user directory...
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredData.length === 0 && (
                            <p className="text-center py-12 text-muted-foreground bg-muted/30 rounded-3xl">No profiles found.</p>
                        )}
                        {filteredData.map((item) => (
                            <Card key={item._id} className="overflow-hidden border-0 shadow-soft bg-card/60 backdrop-blur-sm">
                                <CardContent className="p-0">
                                    <div className="p-4 flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 shrink-0">
                                            {item.avatar ? (
                                                <img src={item.avatar} className="w-full h-full object-cover" />
                                            ) : (
                                                <Baby className="w-8 h-8 text-primary/60" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-lg text-foreground truncate">{item.name}</h3>
                                                <StatusBadge status={item.gender === 'male' ? 'accepted' : item.gender === 'female' ? 'completed' : 'pending'}
                                                    className={item.gender === 'male' ? 'bg-blue-100 text-blue-600' : item.gender === 'female' ? 'bg-pink-100 text-pink-600' : ''}>
                                                    {item.gender || "N/A"}
                                                </StatusBadge>
                                            </div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                                                <Calendar size={10} />
                                                Born: {item.dateOfBirth ? format(new Date(item.dateOfBirth), "MMM d, yyyy") : "N/A"}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-muted">
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Parent Info</p>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-semibold flex items-center gap-2">
                                                            <User size={12} className="text-primary" />
                                                            {item.parentId?.fullName || "N/A"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <Mail size={12} />
                                                            {item.parentId?.email || "N/A"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <Phone size={12} />
                                                            {item.parentId?.phone || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Consultation Links</p>
                                                    <div className="space-y-2">
                                                        {item.consultations && item.consultations.length > 0 ? (
                                                            item.consultations.slice(0, 2).map((c: any) => (
                                                                <div key={c._id} className="bg-muted/50 rounded-lg p-2 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <MessageCircle size={10} className="text-success shrink-0" />
                                                                        <span className="text-[10px] truncate">
                                                                            Dr. {c.practitionerId?.fullName || "Expert"}
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-[10px] text-muted-foreground italic">No active connections.</p>
                                                        )}
                                                        {item.consultations?.length > 2 && (
                                                            <p className="text-[9px] text-primary font-medium">+{item.consultations.length - 2} more connections</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav items={navItems} />
        </div>
    );
};

export default AdminUsers;
