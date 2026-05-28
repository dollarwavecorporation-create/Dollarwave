import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface ResetPasswordState {
  email?: string;
  code?: string;
}

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as ResetPasswordState;
  const email = state.email?.trim().toLowerCase() || "";
  const code = state.code?.trim() || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code) {
      toast.error("Verification session expired. Please request a new code.");
      navigate("/forgot-password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasUpper || !hasLower || !hasSpecial) {
      toast.error("Password must include uppercase, lowercase, and a special character");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password and Confirm Password must match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reset-password-with-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(body?.error || "Unable to reset password");
        return;
      }

      toast.success("Password reset successful. Please sign in.");
      navigate("/login");
    } catch {
      toast.error("Unable to reset password right now");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(43_96%_56%/0.05),transparent_60%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-heading font-bold gold-text">DollarWave</Link>
          <p className="text-muted-foreground mt-2">Set a new password</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          {!email || !code ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your verification session is missing or expired.
              </p>
              <Link to="/forgot-password" className="text-primary hover:underline text-sm">
                Go back to Forgot Password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={email} readOnly className="opacity-80" />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="********"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Must be at least 8 characters and include uppercase, lowercase, and a special character.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
          <p className="text-sm text-center text-muted-foreground mt-4">
            Back to{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
