import { useState, useRef, useEffect } from "react";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Edit2,
  LogOut,
  Camera,
  ChevronRight,
  Shield,
  FileText,
  Bell,
  Home,
  HeartPulse,
  Syringe,
  MessageCircleQuestion,
  Baby,
  Trash2,
  AlertTriangle,
  Star,
  Cloud,
  Leaf,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI, userAPI, babyAPI } from "@/lib/api";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const navItems = [
  { icon: Home, label: "Home", path: "/parent/dashboard" },
  { icon: HeartPulse, label: "Health", path: "/parent/health-log" },
  { icon: Syringe, label: "Vaccines", path: "/parent/vaccination" },
  { icon: MessageCircleQuestion, label: "Ask", path: "/parent/query" },
  { icon: User, label: "Profile", path: "/parent/profile" },
];

const ParentProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const babyPhotoRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
  });

  // Multiple Babies State
  const [babies, setBabies] = useState<any[]>([]);
  const [addBabyOpen, setAddBabyOpen] = useState(false);
  const [newBaby, setNewBaby] = useState({ name: "", dateOfBirth: "", gender: "male" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await userAPI.getProfile();
      setUser(userData);
      setFormData({
        fullName: userData.fullName || "",
        phone: userData.phone || "",
        address: "123 Main St, New York", // Mock data
        email: userData.email || "",
      });

      // Load babies
      const babiesData = await babyAPI.getAll();
      setBabies(Array.isArray(babiesData) ? babiesData : []);
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updatedUser = await userAPI.updateProfile(formData);
      setUser(updatedUser);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        try {
          const updated = await userAPI.updateProfile({ avatar: dataUrl });
          setUser(updated);
          toast.success("Profile photo updated");
        } catch (err) {
          toast.error("Failed to upload photo");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onBabyPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, babyId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        try {
          await babyAPI.update(babyId, { avatar: dataUrl });
          setBabies(prev => prev.map(b => b._id === babyId ? { ...b, avatar: dataUrl } : b));
          toast.success("Baby photo updated");
        } catch (e) {
          toast.error("Failed to update photo");
        }
      }
      reader.readAsDataURL(file);
    }
  };

  const handleAddBaby = async () => {
    if (!newBaby.name || !newBaby.dateOfBirth) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      await babyAPI.create(newBaby);
      toast.success("Baby added!");
      setAddBabyOpen(false);
      setNewBaby({ name: "", dateOfBirth: "", gender: "male" });
      loadProfile(); // reload
    } catch (e: any) {
      toast.error(e.message || "Failed to add baby");
    }
  };

  const handleDeleteBaby = async (id: string) => {
    try {
      await babyAPI.delete(id);
      toast.success("Baby profile removed");
      loadProfile();
    } catch (e) {
      toast.error("Failed to delete baby");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userAPI.deleteAccount();
      toast.success("Account deleted successfully");
      handleLogout();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete account");
    }
  };

  const handleBabyClick = (babyId: string) => {
    localStorage.setItem("selectedBabyId", babyId);
    navigate(`/parent/dashboard?babyId=${babyId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <DesktopNav items={navItems} />
      {/* Header with Gradient and Decorative Elements */}
      <header className="relative h-56 md:h-52 md:mt-4 rounded-b-[2.5rem] overflow-hidden" style={{
        background: 'linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)'
      }}>
        {/* Decorative Leaves and Stars */}
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



        {/* Center Content - Parent Photo and Name */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
          <div
            className="w-24 h-24 rounded-full bg-white/20 p-1 mb-2 relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-b from-white/80 to-white/60 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-primary/60" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">{user?.fullName || "Parent Name"}</h2>
          <p className="text-white/80 text-sm font-medium">{user?.email}</p>
        </div>
      </header>

      <div className="px-4 mt-6 max-w-lg mx-auto space-y-6">

        {/* Baby Profiles Section */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Baby Profiles</h3>
            <Dialog open={addBabyOpen} onOpenChange={setAddBabyOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus size={16} /> Add Baby
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Add New Baby</DialogTitle>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Baby Name</Label>
                    <Input value={newBaby.name} onChange={e => setNewBaby({ ...newBaby, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={newBaby.dateOfBirth} onChange={e => setNewBaby({ ...newBaby, dateOfBirth: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={newBaby.gender} onValueChange={v => setNewBaby({ ...newBaby, gender: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleAddBaby}>Save Baby</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {babies.length === 0 && <p className="text-muted-foreground text-sm italic">No baby profiles added yet.</p>}
            {babies.map(baby => (
              <Card key={baby._id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleBabyClick(baby._id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative group/avatar">
                      <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                        {baby.avatar ? <img src={baby.avatar} className="w-full h-full object-cover" /> : <Baby className="w-full h-full p-2 text-muted-foreground" />}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        id={`file-${baby._id}`}
                        accept="image/*"
                        onClick={e => e.stopPropagation()}
                        onChange={e => onBabyPhotoChange(e, baby._id)}
                      />
                      <label htmlFor={`file-${baby._id}`} onClick={e => e.stopPropagation()} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer rounded-full text-xs">
                        <Camera size={14} />
                      </label>
                    </div>
                    <div>
                      <h4 className="font-semibold">{baby.name}</h4>
                      <p className="text-xs text-muted-foreground">Born: {new Date(baby.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">View Dashboard</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={e => e.stopPropagation()}>
                          <Trash2 size={18} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {baby.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this baby profile and all associated health logs. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={e => e.stopPropagation()}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeleteBaby(baby._id); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Parent Details Form */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Parent Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} className="h-8 gap-2 text-primary">
              <Edit2 size={16} />
              {editing ? "Cancel" : "Edit Details"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.fullName}
              disabled={!editing}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={formData.email}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              disabled={!editing}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {editing && (
            <Button className="w-full mt-4" onClick={handleUpdate} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>

        {/* Settings Links */}
        <div className="space-y-2 pt-4 border-t">

          <Button variant="ghost" className="w-full justify-between h-12 text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => { }}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="flex items-center gap-3 w-full">
                  <AlertTriangle size={20} />
                  <span>Delete Account</span>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your account? This will remove all your data, including all baby profiles. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">Delete Account</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Button>
          <Button variant="ghost" className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/5 gap-3" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
};

export default ParentProfile;
