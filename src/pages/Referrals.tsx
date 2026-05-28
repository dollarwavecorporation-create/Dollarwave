import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BASE_ADDRESS } from "@/lib/config";
import { Users, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { REFERRAL_REWARD_TABLE, getReferralAwardForDeposit, type UserLevel } from "@/lib/rewardSystem";

type RewardTier = (typeof REFERRAL_REWARD_TABLE)[number];

const normalizeLevel = (value: number): UserLevel => {
  if (value >= 5) return 5;
  if (value <= 1) return 1;
  return value as UserLevel;
};

const getTierRewardForLevel = (tier: RewardTier, level: UserLevel): number => {
  switch (level) {
    case 1:
      return tier.level1;
    case 2:
      return tier.level2;
    case 3:
      return tier.level3;
    case 4:
      return tier.level4;
    case 5:
      return tier.level5;
    default:
      return tier.level1;
  }
};

const Referrals = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [level, setLevel] = useState<UserLevel>(1);
  const [exampleDeposit, setExampleDeposit] = useState("100");

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_my_referral_data");
      const rpcRow = rpcData?.[0] as { profile_id: string; referral_code: string; referral_count: number } | undefined;

      if (rpcError || !rpcRow) {
        console.error("Failed to load referral data:", rpcError?.message || "No referral row returned");
        return;
      }

      setReferralCode(rpcRow.referral_code || "");
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", rpcRow.profile_id);
      setReferralCount(count ?? (Number(rpcRow.referral_count) || 0));

      const { data: profile } = await supabase
        .from("profiles")
        .select("level")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile) {
        setLevel(normalizeLevel(Number(profile.level) || 1));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const referralLink = `${BASE_ADDRESS}/register?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const parsedDeposit = Math.max(Number(exampleDeposit) || 0, 0);
  const estimatedReward = getReferralAwardForDeposit(parsedDeposit, level);
  let matchedTier: RewardTier | null = null;
  for (const row of REFERRAL_REWARD_TABLE) {
    if (parsedDeposit >= row.investment) {
      matchedTier = row;
    } else {
      break;
    }
  }
  const matchedTierIndex = matchedTier
    ? REFERRAL_REWARD_TABLE.findIndex(row => row.investment === matchedTier?.investment)
    : -1;
  const nextTier =
    matchedTierIndex >= 0
      ? REFERRAL_REWARD_TABLE[matchedTierIndex + 1] || null
      : REFERRAL_REWARD_TABLE[0] || null;
  const rewardAtMatchedTier = matchedTier ? getTierRewardForLevel(matchedTier, level) : 0;
  const rewardAtNextTier = nextTier ? getTierRewardForLevel(nextTier, level) : null;
  const depositNeededForNextTier = nextTier ? Math.max(nextTier.investment - parsedDeposit, 0) : 0;
  const rewardIncreaseAtNextTier =
    rewardAtNextTier !== null ? Math.max(rewardAtNextTier - rewardAtMatchedTier, 0) : 0;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <h1 className="text-2xl font-heading font-bold mb-1">Referrals</h1>
      <p className="text-muted-foreground mb-8">Invite friends and earn from their first completed deposits.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 w-full">
        <div className="glass-card rounded-xl p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total Referrals</span>
          </div>
          <div className="text-3xl font-heading font-bold">{referralCount}</div>
        </div>
        <div className="glass-card rounded-xl p-6 overflow-hidden">
          <div className="text-sm text-muted-foreground mb-2">Your Referral Code</div>
          <code className="text-2xl font-heading font-bold text-primary break-all">{referralCode || "---"}</code>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 sm:p-6 max-w-xl w-full overflow-hidden">
        <h2 className="font-heading font-semibold mb-2">Share Your Link</h2>
        <p className="text-sm text-muted-foreground mb-4">Share this link with friends to earn referral rewards from their first deposits.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 bg-secondary rounded-lg px-3 sm:px-4 py-2.5 text-xs sm:text-sm break-words break-all font-mono w-full">
            {referralLink}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Join DollarWave", url: referralLink });
                } else {
                  copyLink();
                }
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-card rounded-xl p-6">
        <h2 className="font-heading font-semibold mb-4">How It Works</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span>Share your unique referral link with friends and family.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span>They sign up using your code and complete their first deposit.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span>You receive a one-time bonus based on your level and their first deposit amount.</span>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-card rounded-xl p-4 sm:p-6">
        <h2 className="font-heading font-semibold mb-2">Referral Reward Calculator</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Your referral reward depends on your level and your referred user's first completed deposit amount.
        </p>

        <div className="rounded-lg bg-secondary p-4 mb-4 space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Your current level</div>
            <div className="text-lg font-semibold">Level {level}</div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Referred user's first deposit (USD)</label>
            <input
              type="number"
              min={0}
              value={exampleDeposit}
              onChange={e => setExampleDeposit(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Quick tier examples</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {REFERRAL_REWARD_TABLE.map(tier => {
                const isActive = matchedTier?.investment === tier.investment;
                return (
                  <button
                    key={tier.investment}
                    type="button"
                    onClick={() => setExampleDeposit(String(tier.investment))}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      isActive ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">Deposit ${tier.investment.toLocaleString()}+</div>
                    <div className="text-sm font-semibold text-primary">
                      Earn ${getTierRewardForLevel(tier, level).toFixed(2)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="text-xs text-muted-foreground mb-1">Matched deposit tier</div>
            <div className="text-lg font-semibold">
              {matchedTier ? `$${matchedTier.investment.toLocaleString()}+` : "Below minimum tier"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {matchedTier ? "This is the tier used for reward calculation." : "No reward until first tier is reached."}
            </div>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
            <div className="text-xs text-muted-foreground mb-1">Estimated reward for you</div>
            <div className="text-2xl font-heading font-bold text-primary">${estimatedReward.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Based on Level {level} and first deposit amount.</div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="text-xs text-muted-foreground mb-1">Next reward target</div>
            {nextTier ? (
              <>
                <div className="text-sm font-semibold">
                  Need ${depositNeededForNextTier.toFixed(2)} more to reach ${nextTier.investment.toLocaleString()}+
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Your reward would be ${rewardAtNextTier?.toFixed(2)} (
                  +${rewardIncreaseAtNextTier.toFixed(2)} from current tier).
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold">Top tier reached</div>
                <div className="text-xs text-muted-foreground mt-1">
                  This deposit amount already gives the highest listed referral reward.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
