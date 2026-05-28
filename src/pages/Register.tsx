import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { EMAIL_REDIRECT_URL } from "@/lib/config";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

const Register = () => {
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [email, setEmail] = useState("");
  const [countryIso, setCountryIso] = useState<CountryCode>("PK" as CountryCode);
  const [nationalNumber, setNationalNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sanitizeNational = (n: string) => n.trim().replace(/\D/g, "");

  // Build a dynamic country list using libphonenumber-js
  const isoList = getCountries();
  let displayNamesFn: ((iso: string) => string) | null = null;
  try {
    // Intl.DisplayNames may not be available in some environments/TS libs
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    displayNamesFn = (iso: string) => (dn.of(iso) as string) || iso;
  } catch {
    displayNamesFn = null;
  }

  const countries = isoList.map(iso => {
    const calling = getCountryCallingCode(iso as CountryCode);
    return {
      iso,
      name: displayNamesFn ? displayNamesFn(iso) : iso,
      callingCode: `+${calling}`,
      callingDigits: calling
    };
  });

  const countryMap = Object.fromEntries(countries.map(c => [c.iso, c]));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (!hasUpper || !hasLower || !hasSpecial) {
      toast.error("Password must include uppercase, lowercase, and a special character");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password must match");
      return;
    }

    // Country code + national number flow (select code, input national number)

    const normalizedNational = sanitizeNational(nationalNumber);
    if (!normalizedNational) {
      toast.error("Please enter your phone number without the country code.");
      return;
    }

    // Build full E.164 and validate using libphonenumber-js
    const calling = getCountryCallingCode(countryIso as CountryCode);
    const full = `+${calling}${normalizedNational}`;
    const phone = parsePhoneNumberFromString(full);
    if (!phone || !phone.isValid() || phone.country !== countryIso) {
      toast.error("Invalid phone number for the selected country.");
      return;
    }

    const normalizedPhone = full;

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const { data: isTaken, error: emailCheckError } = await supabase.rpc("is_email_taken", {
      candidate: normalizedEmail,
    });

    if (emailCheckError) {
      setLoading(false);
      toast.error("Unable to validate this email right now. Please try again.");
      return;
    }

    if (isTaken) {
      setLoading(false);
      toast.error("An account with this email already exists. Please sign in.");
      return;
    }

    // Ensure phone is unique
    const { data: phoneTaken, error: phoneCheckError } = await supabase.rpc("is_phone_taken", {
      candidate: normalizedPhone,
    });

    if (phoneCheckError) {
      setLoading(false);
      toast.error("Unable to validate this phone number right now. Please try again.");
      return;
    }

    if (phoneTaken) {
      setLoading(false);
      toast.error("Number Already Exists");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: fullName, referral_code: referralCode.trim(), phone_number: normalizedPhone },
        emailRedirectTo: EMAIL_REDIRECT_URL,
      },
    });
    setLoading(false);

    if (error) {
      const errMsg = (error.message || '').toLowerCase();

      if (errMsg.includes('phone_number is required') || errMsg.includes('phone number is required')) {
        toast.error('Phone number is required for signup. Please provide your phone number.');
      } else if ((errMsg.includes('unique') || errMsg.includes('duplicate')) && errMsg.includes('phone')) {
        // Handle DB-side duplicate phone constraint (race conditions)
        toast.error('Number Already Exists');
      } else {
        toast.error(error.message || 'Signup failed. Please try again.');
      }
    } else {
      toast.success("Account created! Please check your email to verify.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(43_96%_56%/0.05),transparent_60%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-heading font-bold gold-text">DollarWave</Link>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <AlertTitle>Important: One account per person</AlertTitle>
              <AlertDescription>
                Creating multiple accounts is not allowed and may result in suspension or permanent ban.
                We monitor for duplicate accounts using IP and device signals; multiple accounts from the
                same device or IP address may be blocked. If you believe this is an error, contact support.
              </AlertDescription>
            </div>
          </Alert>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex space-x-2">
                <select
                  id="countryCode"
                  value={countryIso}
                  onChange={e => {
                    const newIso = e.target.value as CountryCode;
                    const max = Math.max(1, 15 - (getCountryCallingCode(newIso as CountryCode)?.length ?? 1));
                    setCountryIso(newIso);
                    setNationalNumber(n => n.slice(0, max));
                  }}
                  className="w-36 flex-shrink-0 px-3 py-2 rounded-md border bg-background"
                >
                  {countries.map(c => (
                    <option key={c.iso} value={c.iso}>{c.name} ({c.callingCode})</option>
                  ))}
                </select>
                <div className="flex-1">
                  <Input
                    id="nationalNumber"
                    className="w-full"
                    value={nationalNumber}
                    onChange={e => setNationalNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder={countryMap[countryIso]?.callingDigits ? `e.g. ${countryMap[countryIso].callingDigits}...` : "Enter national number"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={Math.max(1, 15 - (getCountryCallingCode(countryIso as CountryCode)?.length ?? 1))}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Select country code then enter national number (no spaces or letters)</p>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Must be at least 8 characters and include uppercase, lowercase, and a special character.
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
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
            </div>
            <div>
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
