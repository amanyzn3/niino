import { useEffect, useState, useMemo } from "react";
import {
    FileText,
    Search,
    Filter,
    Trash2,
    CheckCircle2,
    XCircle,
    LogOut,
    Home,
    Users,
    User,
    Star,
    Cloud,
    Leaf,
    ChevronRight,
    ExternalLink,
    Syringe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { StatusBadge } from "@/components/StatusBadge";
import { adminAPI, contentAPI, authAPI } from "@/lib/api";
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

const AdminContent = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    useEffect(() => {
        const user = authAPI.getCurrentUser();
        if (user && user.role === 'admin') {
            setCurrentUser(user);
        } else {
            navigate("/login");
        }
        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getContent();
            setContent(Array.isArray(data) ? data : []);
        } catch (error: any) {
            toast.error("Failed to load articles");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await contentAPI.approve(id);
            toast.success("Article approved successfully");
            loadData();
        } catch (error) {
            toast.error("Approval failed");
        }
    };

    const handleReject = async (id: string) => {
        try {
            await contentAPI.reject(id);
            toast.success("Article rejected");
            loadData();
        } catch (error) {
            toast.error("Rejection failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) return;
        try {
            await contentAPI.delete(id);
            toast.success("Article deleted");
            loadData();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        navigate("/login");
    };

    const filteredContent = useMemo(() => {
        return content.filter(c => {
            const title = c.title || "";
            const desc = c.description || "";
            const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) ||
                desc.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = status === "all" || c.status === status;
            return matchesSearch && matchesStatus;
        });
    }, [content, search, status]);

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
            <DesktopNav items={navItems} />

            {/* Header with Nino Care aesthetics */}
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
                    <FileText size={48} className="mb-2 text-white/80" />
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Article Moderation</h1>
                    <p className="text-white/70 text-sm">Reviewing {content.length} Expert Submissions</p>
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
                            placeholder="Search by title or description..."
                            className="pl-10 h-12 rounded-2xl border-0 shadow-soft"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full md:w-[180px] h-12 rounded-2xl bg-card border-0 shadow-soft">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3 h-3 text-muted-foreground" />
                                <SelectValue placeholder="All Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-muted-foreground animate-pulse">
                        Fetching expert articles...
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredContent.length === 0 && (
                            <p className="text-center py-12 text-muted-foreground bg-muted/30 rounded-3xl">No articles found.</p>
                        )}
                        {filteredContent.map((item) => (
                            <Card key={item._id} className="overflow-hidden border-0 shadow-soft bg-card/60 backdrop-blur-sm group">
                                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0 relative">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <FileText size={10} />
                                            Article Submission
                                        </p>
                                        <CardTitle className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                            {item.title}
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={item.status} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDelete(item._id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                                        {item.description}
                                    </p>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-muted">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border">
                                                {item.practitionerId?.avatar ? (
                                                    <img src={item.practitionerId.avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={18} className="text-primary/60" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground">{item.practitionerId?.fullName || "Expert"}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                                                    {item.practitionerId?.specialization || "Practitioner"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {item.status !== "approved" && (
                                                <Button
                                                    size="sm"
                                                    className="flex-1 md:flex-none h-9 px-4 rounded-xl bg-success hover:bg-success/90 gap-2"
                                                    onClick={() => handleApprove(item._id)}
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Approve
                                                </Button>
                                            )}
                                            {item.status !== "rejected" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 md:flex-none h-9 px-4 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/10 gap-2"
                                                    onClick={() => handleReject(item._id)}
                                                >
                                                    <XCircle size={14} />
                                                    Reject
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl hover:bg-muted"
                                                onClick={() => window.open(`/parent/content/${item._id}`, '_blank')}
                                                title="Preview Article"
                                            >
                                                <ExternalLink size={16} className="text-muted-foreground" />
                                            </Button>
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

export default AdminContent;
