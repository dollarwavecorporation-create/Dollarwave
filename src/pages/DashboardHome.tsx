import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, TrendingUp, Users, ArrowDownToLine } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  balance: number;
  earnings: number;
  level: number;
  referral_count: number;
  referral_code: string | null;
  full_name: string;
}

const DashboardHome = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [liveReferralCount, setLiveReferralCount] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_my_referral_data");
      const rpcRow = rpcData?.[0] as { profile_id: string; referral_code: string; referral_count: number } | undefined;

      if (!rpcError && rpcRow) {
        setReferralCode(rpcRow.referral_code || "");
        const { count } = await supabase
          .from("referrals")
          .select("*", { count: "exact", head: true })
          .eq("referrer_id", rpcRow.profile_id);
        setLiveReferralCount(count ?? (Number(rpcRow.referral_count) || 0));
      } else {
        setReferralCode("");
        setLiveReferralCount(null);
      }

      const { data: authData } = await supabase.auth.getUser();
      const activeUserId = authData.user?.id || user?.id;
      if (!activeUserId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", activeUserId)
        .maybeSingle();

      if (error) {
        console.error("Failed to load profile:", error.message);
        return;
      }

      setProfile((data as unknown as Profile | null) ?? null);
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const cards = [
    { label: "Balance", value: `$${profile?.balance?.toFixed(2) || "0.00"}`, icon: Wallet, color: "text-primary" },
    { label: "Earnings", value: `$${profile?.earnings?.toFixed(2) || "0.00"}`, icon: TrendingUp, color: "text-success" },
    { label: "Level", value: profile?.level || 1, icon: ArrowDownToLine, color: "text-primary" },
    { label: "Referrals", value: liveReferralCount ?? profile?.referral_count ?? 0, icon: Users, color: "text-accent" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-1">
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>
      <p className="text-muted-foreground mb-8">Here's your account overview.</p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <div className="text-2xl font-heading font-bold">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 glass-card rounded-xl p-6">
        <h2 className="font-heading font-semibold mb-2">Your Referral Code</h2>
        <p className="text-muted-foreground text-sm mb-3">Share this code with friends to earn referral rewards.</p>
        <div className="flex items-center gap-3">
          <code className="bg-secondary px-4 py-2 rounded-lg text-primary font-mono text-lg">
            {referralCode.trim() || "---"}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralCode || "");
            }}
            className="text-sm text-primary hover:underline"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
