import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import {
  DEPOSIT_FIXED_AMOUNTS,
  LEVEL_REQUIREMENTS,
  LEVEL_PERCENTAGE_BY_LEVEL,
  type UserLevel,
  getMiningRewardsFromBalance,
} from "@/lib/rewardSystem";

const LEVEL_MILESTONES = [
  { level: 1 as const, minBalance: LEVEL_REQUIREMENTS[1].minBalance, minReferrals: LEVEL_REQUIREMENTS[1].minReferrals },
  { level: 2 as const, minBalance: LEVEL_REQUIREMENTS[2].minBalance, minReferrals: LEVEL_REQUIREMENTS[2].minReferrals },
  { level: 3 as const, minBalance: LEVEL_REQUIREMENTS[3].minBalance, minReferrals: LEVEL_REQUIREMENTS[3].minReferrals },
  { level: 4 as const, minBalance: LEVEL_REQUIREMENTS[4].minBalance, minReferrals: LEVEL_REQUIREMENTS[4].minReferrals },
  { level: 5 as const, minBalance: LEVEL_REQUIREMENTS[5].minBalance, minReferrals: LEVEL_REQUIREMENTS[5].minReferrals },
];

const formatUsd = (amount: number) =>
  `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const normalizeLevel = (value: number): UserLevel => {
  if (value >= 5) return 5;
  if (value <= 1) return 1;
  return value as UserLevel;
};

const Deposit = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null);
  const [balance, setBalance] = useState(0);
  const [level, setLevel] = useState<UserLevel>(1);
  const [referralCount, setReferralCount] = useState(0);

  const mining = useMemo(() => getMiningRewardsFromBalance(balance, level), [balance, level]);
  const nextMilestone = LEVEL_MILESTONES.find(tier => tier.level > level);
  const amountToNextLevel = nextMilestone ? Math.max(nextMilestone.minBalance - balance, 0) : 0;
  const referralsToNextLevel = nextMilestone ? Math.max(nextMilestone.minReferrals - referralCount, 0) : 0;

  const fetchProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("balance, level, referral_count")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load profile data");
      return;
    }

    const nextBalance = Number(data?.balance) || 0;
    const dbLevel = Number(data?.level) || 1;
    setBalance(nextBalance);
    setLevel(normalizeLevel(dbLevel));
    setReferralCount(Number(data?.referral_count) || 0);
  }, [user.id]);

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 10000);
    return () => clearInterval(interval);
  }, [fetchProfile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentState = params.get("payment");
    if (paymentState === "success") {
      toast.success("Payment received. Balance will update once NOWPayments marks it as finished.");
    } else if (paymentState === "cancel") {
      toast.error("Payment was cancelled. You can try again anytime.");
    }
  }, []);

  const createNowpaymentsDeposit = async (amount: number) => {
    setLoadingAmount(amount);
    try {
      const { data, error } = await supabase.functions.invoke("create-nowpayment", {
        body: { amount },
      });

      if (error) {
        toast.error(error.message || "Failed to initialize payment");
        return;
      }

      const invoiceUrl =
        data && typeof data === "object" && "invoice_url" in data
          ? String((data as { invoice_url?: string }).invoice_url || "")
          : "";

      if (!invoiceUrl) {
        toast.error("Failed to get checkout URL from NOWPayments");
        return;
      }

      window.location.assign(invoiceUrl);
    } catch {
      toast.error("Failed to initialize payment");
    } finally {
      setLoadingAmount(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-1">Deposit Funds</h1>
      <p className="text-muted-foreground mb-8">
        Level upgrades are based on both deposited balance and total successful referrals.
      </p>

      <div className="glass-card rounded-xl p-4 sm:p-5 mb-8 space-y-2">
        <div className="text-xs text-muted-foreground">Current Mining Level</div>
        <div className="text-lg font-heading font-bold">
          Level {level} ({LEVEL_PERCENTAGE_BY_LEVEL[level]}% / day)
        </div>
        <div className="text-sm text-muted-foreground">Current Deposit Balance: ${balance.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">Current Successful Referrals: {referralCount}</div>
        <div className="text-sm">
          Mining estimate: <span className="text-primary font-medium">${mining.daily.toFixed(2)} / day</span>{" "}
          and <span className="text-primary font-medium">${mining.perMine.toFixed(2)} / hour</span>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 sm:p-6 mb-8">
        <h2 className="font-heading font-semibold mb-2">Level Milestones</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Exact level requirements from backend rules (deposit + referrals).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {LEVEL_MILESTONES.map(tier => {
            const isUnlocked = balance >= tier.minBalance && referralCount >= tier.minReferrals;
            const isCurrent = level === tier.level;

            return (
              <div
                key={tier.level}
                className={`rounded-lg border p-3 transition-colors ${
                  isCurrent
                    ? "border-primary bg-primary/10"
                    : isUnlocked
                      ? "border-success/40 bg-success/10"
                      : "border-border bg-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Level {tier.level}</span>
                  <span className={`text-[11px] font-medium ${isUnlocked ? "text-success" : "text-muted-foreground"}`}>
                    {isUnlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <div className="text-lg font-heading font-bold">{LEVEL_PERCENTAGE_BY_LEVEL[tier.level]}% / day</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Deposit required: {formatUsd(tier.minBalance)}+
                </div>
                <div className="text-xs text-muted-foreground">
                  Referrals required: {tier.minReferrals}+
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
          {nextMilestone ? (
            <p>
              To unlock <span className="font-semibold">Level {nextMilestone.level}</span>, you still need{" "}
              <span className="font-semibold text-primary">{formatUsd(amountToNextLevel)}</span> deposit and{" "}
              <span className="font-semibold text-primary">{referralsToNextLevel}</span> referrals (
              {LEVEL_PERCENTAGE_BY_LEVEL[nextMilestone.level]}% / day).
            </p>
          ) : (
            <p>
              You are at the highest tier. Keep growing balance to maximize daily mining rewards at{" "}
              <span className="font-semibold text-primary">3.5% / day</span>.
            </p>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 sm:p-6 max-w-2xl">
        <h2 className="font-heading font-semibold mb-2">Choose Deposit Amount</h2>
        <p className="text-sm text-muted-foreground mb-4">
          You will be redirected to NOWPayments checkout. Balance is credited only after NOWPayments sends{" "}
          <code>payment_status=finished</code>. A 5% platform fee is applied to each successful deposit credit.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {DEPOSIT_FIXED_AMOUNTS.map(amount => (
            <Button
              key={amount}
              type="button"
              variant="outline"
              disabled={loadingAmount !== null}
              onClick={() => createNowpaymentsDeposit(amount)}
            >
              {loadingAmount === amount ? "Processing..." : `$${amount}`}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Milestone guide: L2 = {formatUsd(500)} + 8 referrals, L3 = {formatUsd(1000)} + 25 referrals, L4 ={" "}
          {formatUsd(2500)} + 50 referrals, L5 = {formatUsd(5000)} + 120 referrals.
        </p>
      </div>
    </div>
  );
};

export default Deposit;
