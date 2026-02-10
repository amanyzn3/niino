import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Phone, Baby, Star, Cloud, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      toast.success("Login successful!");

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
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative Header */}
      <header
        className="relative h-56 rounded-b-[2.5rem] overflow-hidden"
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
        <Star className="absolute top-14 right-8 w-4 h-4 text-white/50 fill-white/50" />
        <Cloud className="absolute top-16 left-4 w-10 h-10 text-white/20 fill-white/10" />
        <Cloud className="absolute top-20 right-6 w-12 h-12 text-white/25 fill-white/15" />
        <div className="absolute bottom-4 left-4">
          <Leaf className="w-6 h-6 text-white/25 rotate-[120deg]" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Leaf className="w-6 h-6 text-white/25 rotate-[-120deg]" />
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 p-1 mb-3">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-white/80 to-white/60 flex items-center justify-center">
              <Baby className="w-8 h-8 text-primary/60" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">Welcome Back</h1>
          <p className="text-white/80 text-sm">Sign in to continue</p>
        </div>
      </header>

      {/* Login Form */}
      <div className="px-4 mt-4 max-w-md mx-auto">
        <Card className="shadow-soft border-0 animate-slide-up">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {usePhone ? "Phone Number" : "Email Address"}
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {usePhone ? <Phone size={18} /> : <Mail size={18} />}
                  </div>
                  <Input
                    id="email"
                    type={usePhone ? "tel" : "email"}
                    placeholder={usePhone ? "+1 234 567 890" : "parent@example.com"}
                    className="pl-10 h-12 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setUsePhone(!usePhone)}
                  className="text-xs text-primary hover:underline"
                >
                  Use {usePhone ? "email" : "phone"} instead
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
