import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    const userId = data?.user?.id ?? (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      toast.error("Unable to verify user after sign-in");
      return;
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_banned")
        .eq("user_id", userId)
        .single();

      if (profile?.is_banned) {
        await supabase.auth.signOut();
        toast.error("Your account has been banned by an administrator. Contact support.");
        return;
      }
    } catch (err) {
      // If the profile lookup fails due to RLS or other, allow login but log a warning.
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(43_96%_56%/0.05),transparent_60%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-heading font-bold gold-text">DollarWave</Link>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="********" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
