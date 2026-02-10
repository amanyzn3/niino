import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Baby, Stethoscope, Calendar, FileCheck, Star, Cloud, Leaf, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";

type UserRole = "parent" | "practitioner";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("parent");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    babyName: "",
    specialization: "",
    licenseNumber: "",
    qualification: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatName = (value: string) => {
    // Capitalize first letter of each word, keep remaining characters as typed
    return value.replace(/(^|\s)([a-z])/g, (m) => m.toUpperCase());
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (role === "practitioner") {
      if (!formData.specialization) {
        toast.error("Please select your specialization");
        return;
      }
      if (!formData.licenseNumber.trim()) {
        toast.error("Please enter your medical license number");
        return;
      }
      if (!formData.qualification.trim()) {
        toast.error("Please enter your qualification details");
        return;
      }
    }

    setLoading(true);
    try {
      const registerData: any = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role,
        phone: formData.phone || undefined,
      };

      if (role === "parent") {
        registerData.gender = formData.gender || undefined;
        registerData.dateOfBirth = formData.dateOfBirth || undefined;
        registerData.babyName = formData.babyName || undefined;
      } else {
        registerData.specialization = formData.specialization || undefined;
        registerData.licenseNumber = formData.licenseNumber || undefined;
        registerData.qualification = formData.qualification || undefined;
      }

      const response = await authAPI.register(registerData);
      toast.success("Registration successful!");

      if (response.role === "parent") {
        navigate("/parent/dashboard");
      } else if (response.role === "practitioner") {
        navigate("/practitioner/dashboard");
      } else if (response.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Decorative Header */}
      <header
        className="relative h-48 rounded-b-[2.5rem] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)",
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-4 left-2">
          <Leaf className="w-5 h-5 text-white/30 rotate-[-30deg]" />
          <Leaf className="w-4 h-4 text-white/25 rotate-[-60deg] -mt-1 ml-2" />
        </div>
        <div className="absolute top-4 right-2">
          <Leaf className="w-5 h-5 text-white/30 rotate-[30deg] ml-auto" />
          <Leaf className="w-4 h-4 text-white/25 rotate-[60deg] -mt-1 mr-2" />
        </div>
        <Star className="absolute top-10 left-1/4 w-3 h-3 text-white/40 fill-white/40" />
        <Star className="absolute top-12 right-8 w-4 h-4 text-white/50 fill-white/50" />
        <Cloud className="absolute top-14 left-4 w-10 h-10 text-white/20 fill-white/10" />
        <Cloud className="absolute top-16 right-6 w-12 h-12 text-white/25 fill-white/15" />
        <div className="absolute bottom-4 left-4">
          <Leaf className="w-6 h-6 text-white/25 rotate-[120deg]" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Leaf className="w-6 h-6 text-white/25 rotate-[-120deg]" />
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold text-white">Create Account</h1>
          <p className="text-white/80 text-sm">Join our baby health community</p>
        </div>
      </header>

      {/* Register Form */}
      <div className="px-4 mt-4 max-w-md mx-auto">
        <Card className="shadow-soft border-0 animate-slide-up">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("parent")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      role === "parent"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Baby
                      size={28}
                      className={role === "parent" ? "text-primary" : "text-muted-foreground"}
                    />
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        role === "parent" ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      Parent
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("practitioner")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      role === "practitioner"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Stethoscope
                      size={28}
                      className={role === "practitioner" ? "text-primary" : "text-muted-foreground"}
                    />
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        role === "practitioner" ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      Practitioner
                    </span>
                  </button>
                </div>
              </div>

              {/* Common Fields */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    className="pl-10 h-12 rounded-xl"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: formatName(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-12 rounded-xl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10 h-12 rounded-xl"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="pl-10 h-12 rounded-xl"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm"
                      className="h-12 rounded-xl"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Parent-specific fields */}
              {role === "parent" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="babyName">Baby's Name</Label>
                    <div className="relative">
                      <Baby size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="babyName"
                        placeholder="Your little one's name"
                        className="pl-10 h-12 rounded-xl"
                        value={formData.babyName}
                        onChange={(e) => setFormData({ ...formData, babyName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Baby's Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Baby's Date of Birth</Label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="dob"
                          type="date"
                          className="pl-10 h-12 rounded-xl"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Practitioner-specific fields */}
              {role === "practitioner" && (
                <>
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Select value={formData.specialization} onValueChange={(value) => setFormData({ ...formData, specialization: value })}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pediatrician">Pediatrician</SelectItem>
                        <SelectItem value="neonatologist">Neonatologist</SelectItem>
                        <SelectItem value="child-psychologist">Child Psychologist</SelectItem>
                        <SelectItem value="nutritionist">Pediatric Nutritionist</SelectItem>
                        <SelectItem value="general">General Practitioner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">Medical License Number</Label>
                    <div className="relative">
                      <FileCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="license"
                        placeholder="e.g., MD-12345678"
                        className="pl-10 h-12 rounded-xl"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification Details</Label>
                    <Input
                      id="qualification"
                      placeholder="e.g., MBBS, MD Pediatrics"
                      className="h-12 rounded-xl"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
