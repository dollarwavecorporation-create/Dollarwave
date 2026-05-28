import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Enter your email");
      return;
    }

    setRequesting(true);
    try {
      const response = await fetch("/api/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(body?.error || "Unable to send reset code right now");
        return;
      }

      setEmail(normalizedEmail);
      setCodeSent(true);
      toast.success(body?.message || "If this email is registered, a reset code has been sent.");
    } catch {
      toast.error("Unable to send reset code right now");
    } finally {
      setRequesting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !code.trim()) {
      toast.error("Enter both email and 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch("/api/verify-password-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, code: code.trim() }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(body?.error || "Invalid or expired code");
        return;
      }

      navigate("/reset-password", {
        state: { email: normalizedEmail, code: code.trim() },
      });
    } catch {
      toast.error("Unable to verify code right now");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(43_96%_56%/0.05),transparent_60%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-heading font-bold gold-text">DollarWave</Link>
          <p className="text-muted-foreground mt-2">Reset your password</p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-6">
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={requesting}>
              {requesting ? "Sending code..." : "Send 6-Digit Code"}
            </Button>
          </form>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                required
                disabled={!codeSent}
              />
              <p className="text-xs text-muted-foreground mt-2">Enter the 6-digit code sent to your email.</p>
            </div>
            <Button type="submit" className="w-full" disabled={!codeSent || verifying}>
              {verifying ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Back to{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
