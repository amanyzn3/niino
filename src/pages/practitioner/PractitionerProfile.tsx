import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Award,
  Stethoscope,
  FileCheck,
  Edit2,
  Home,
  MessageCircleQuestion,
  FileText,
  LogOut,
  ShieldCheck
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { authAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { icon: Home, label: "Home", path: "/practitioner/dashboard" },
  { icon: MessageCircleQuestion, label: "Queries", path: "/practitioner/queries" },
  { icon: FileText, label: "Content", path: "/practitioner/content" },
  { icon: User, label: "Profile", path: "/practitioner/profile" },
];

const PractitionerProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    qualification: "",
    experienceYears: "",
    hospital: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const p = await userAPI.getProfile();
        if (!mounted) return;
        setProfile(p);
        setForm({
          fullName: p?.fullName || "",
          phone: p?.phone || "",
          specialization: p?.specialization || "",
          licenseNumber: p?.licenseNumber || "",
          qualification: p?.qualification || "",
          experienceYears: p?.experienceYears != null ? String(p.experienceYears) : "",
          hospital: p?.hospital || "",
        });
      } catch (e: any) {
        toast.error(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = () => {
    authAPI.logout();
    navigate("/login");
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        specialization: form.specialization.trim() || undefined,
        licenseNumber: form.licenseNumber.trim() || undefined,
        qualification: form.qualification.trim() || undefined,
        hospital: form.hospital.trim() || undefined,
      };

      if (form.experienceYears.trim()) {
        const num = Number(form.experienceYears);
        if (Number.isFinite(num)) payload.experienceYears = num;
      }

      const updated = await userAPI.updateProfile(payload);
      setProfile(updated);
      setEditing(false);

      // keep localStorage "user" in sync if present
      const existing = authAPI.getCurrentUser?.();
      if (existing) {
        localStorage.setItem("user", JSON.stringify({ ...existing, ...updated }));
      }

      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile");
    }
  };

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
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <DesktopNav items={navItems} />

      <div className="px-4 pt-6 max-w-lg mx-auto md:max-w-4xl md:pt-4">
        <PageHeader
          title="My Profile"
          subtitle="Professional information"
          backTo="/practitioner/dashboard"
        />

        <div className="md:grid md:grid-cols-2 md:gap-6">
          {/* Profile Header */}
          <Card className="mb-6 md:mb-0 gradient-accent border-0 animate-slide-up md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
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
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl bg-white/30 flex items-center justify-center overflow-hidden"
                  aria-label="Change profile photo"
                >
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Stethoscope size={36} className="text-accent-foreground" />
                  )}
                </button>
                <div>
                  <h2 className="text-xl font-bold text-accent-foreground">
                    {profile?.fullName || (loading ? "Loading..." : "Practitioner")}
                  </h2>
                  <p className="text-accent-foreground/70">{profile?.specialization || ""}</p>
                  <p className="text-sm text-accent-foreground/60">
                    {profile?.experienceYears != null ? `${profile.experienceYears} years experience` : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-4 md:mb-0 animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email || ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Phone size={18} className="text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile?.phone || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card className="mb-4 md:mb-0 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Award size={18} className="text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Qualification</p>
                  <p className="font-medium">{profile?.qualification || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning flex items-center justify-center">
                  <Stethoscope size={18} className="text-warning-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Specialization</p>
                  <p className="font-medium">{profile?.specialization || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-peach flex items-center justify-center">
                  <FileCheck size={18} className="text-peach-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">License Number</p>
                  <p className="font-medium">{profile?.licenseNumber || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3 animate-slide-up mt-4" style={{ animationDelay: "150ms" }}>
          {editing ? (
            <>
              <Button className="flex-1 gap-2" onClick={handleSave}>
                Save
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    fullName: profile?.fullName || "",
                    phone: profile?.phone || "",
                    specialization: profile?.specialization || "",
                    licenseNumber: profile?.licenseNumber || "",
                    qualification: profile?.qualification || "",
                    experienceYears: profile?.experienceYears != null ? String(profile.experienceYears) : "",
                    hospital: profile?.hospital || "",
                  });
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button className="flex-1 gap-2" onClick={() => setEditing(true)}>
              <Edit2 size={16} />
              Edit Profile
            </Button>
          )}
        </div>

        {editing && (
          <Card className="mt-4 animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Edit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>License Number</Label>
                  <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Qualification</Label>
                <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience (years)</Label>
                  <Input
                    inputMode="numeric"
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hospital</Label>
                  <Input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sign Out Button */}
        <Button
          variant="outline"
          className="w-full mt-6 gap-2 text-foreground/70 hover:bg-muted"
          onClick={handleSignOut}
        >
          <LogOut size={18} />
          Sign Out
        </Button>

        {/* Danger Zone */}
        <Card className="mt-8 border-destructive/20 bg-destructive/5 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              <ShieldCheck size={18} />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting your account is permanent. All your data, including profile information and content submissions, will be permanently removed.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    try {
                      await userAPI.deleteAccount();
                      authAPI.logout();
                      navigate("/login");
                      toast.success("Account deleted successfully");
                    } catch (error: any) {
                      toast.error(error.message || "Failed to delete account");
                    }
                  }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
};

export default PractitionerProfile;
