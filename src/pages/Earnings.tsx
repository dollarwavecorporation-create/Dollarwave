import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  LEVEL_REQUIREMENTS,
  LEVEL_PERCENTAGE_BY_LEVEL,
  type UserLevel,
  getMiningRewardsFromBalance,
} from "@/lib/rewardSystem";

interface ActiveSession {
  id: string;
  started_at: string;
  ends_at: string;
  reward_amount: number;
}

const normalizeLevel = (value: number): UserLevel => {
  if (value >= 5) return 5;
  if (value <= 1) return 1;
  return value as UserLevel;
};

const Earnings = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [earnings, setEarnings] = useState(0);
  const [balance, setBalance] = useState(0);
  const [level, setLevel] = useState<UserLevel>(1);
  const [returnPercentage, setReturnPercentage] = useState(1.5);
  const [dailyReturnAmount, setDailyReturnAmount] = useState(0);
  const [perMineReturnAmount, setPerMineReturnAmount] = useState(0);
  const [lastMiningReward, setLastMiningReward] = useState(0);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownText, setCooldownText] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  const localCalculated = useMemo(() => getMiningRewardsFromBalance(balance, level), [balance, level]);

  const fetchProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("earnings, balance, level, return_percentage, daily_return_amount, per_mine_return_amount, last_mining_reward")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) return;

    const nextBalance = Number(data.balance) || 0;
    const nextLevel = normalizeLevel(Number(data.level) || 1);
    setEarnings(Number(data.earnings) || 0);
    setBalance(nextBalance);
    setLevel(nextLevel);
    setReturnPercentage(Number(data.return_percentage) || LEVEL_PERCENTAGE_BY_LEVEL[nextLevel]);
    setDailyReturnAmount(Number(data.daily_return_amount) || 0);
    setPerMineReturnAmount(Number(data.per_mine_return_amount) || 0);
    setLastMiningReward(Number(data.last_mining_reward) || 0);
  }, [user.id]);

  const fetchActiveSession = useCallback(async () => {
    const { data } = await supabase
      .from("mining_sessions")
      .select("id, started_at, ends_at, reward_amount, completed")
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("started_at", { ascending: false })
      .maybeSingle();

    if (!data) {
      setActiveSession(null);
      setSessionReady(false);
      return;
    }

    const session: ActiveSession = {
      id: data.id,
      started_at: data.started_at,
      ends_at: data.ends_at,
      reward_amount: Number(data.reward_amount) || 0,
    };
    setActiveSession(session);
  }, [user.id]);

  useEffect(() => {
    if (!user?.id) return;

    const refresh = async () => {
      await Promise.all([fetchProfile(), fetchActiveSession()]);
    };

    refresh();
    const poll = setInterval(refresh, 5000);
    return () => clearInterval(poll);
  }, [user?.id, fetchActiveSession, fetchProfile]);

  useEffect(() => {
    const tick = () => {
      if (!activeSession) {
        setCooldownText("");
        setSessionReady(false);
        return;
      }

      const remaining = new Date(activeSession.ends_at).getTime() - Date.now();
      if (remaining <= 0) {
        setCooldownText("0h 0m 0s");
        setSessionReady(true);
        return;
      }

      const hours = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCooldownText(`${hours}h ${mins}m ${secs}s`);
      setSessionReady(false);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const handleMine = async () => {
    if (balance <= 0) {
      toast.error("Deposit funds first to start mining returns.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc("start_mining_session");
    setLoading(false);

    if (error || !data) {
      toast.error(error?.message || "Failed to start mining session");
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.id) {
      toast.error("Failed to start mining session");
      return;
    }

    setActiveSession({
      id: row.id as string,
      started_at: row.started_at as string,
      ends_at: row.ends_at as string,
      reward_amount: Number(row.reward_amount) || 0,
    });
    setLevel(normalizeLevel(Number(row.level) || level));
    setReturnPercentage(Number(row.return_percentage) || returnPercentage);
    setDailyReturnAmount(Number(row.daily_return_amount) || dailyReturnAmount);
    setPerMineReturnAmount(Number(row.per_mine_return_amount) || perMineReturnAmount);
    toast.success("Mining started. Session length is 1 hour.");
  };

  const collectReward = async () => {
    if (!activeSession?.id) return;

    setLoading(true);
    const { error } = await supabase.rpc("collect_mining_reward", { p_session_id: activeSession.id });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to collect reward");
      return;
    }

    await Promise.all([fetchProfile(), fetchActiveSession()]);
    toast.success("Mining reward added to earnings.");
  };

  const rateForDisplay = returnPercentage || LEVEL_PERCENTAGE_BY_LEVEL[level];
  const dailyForDisplay = dailyReturnAmount || localCalculated.daily;
  const perMineForDisplay = perMineReturnAmount || localCalculated.perMine;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-1">Earnings</h1>
      <p className="text-muted-foreground mb-8">Start mining to earn hourly rewards based on your level and deposited balance.</p>

      <div className="glass-card rounded-xl p-5 sm:p-8 max-w-xl text-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-6">
          <div className="bg-secondary rounded-lg p-2">
            <div className="text-muted-foreground">Level</div>
            <div className="font-semibold">{level}</div>
          </div>
          <div className="bg-secondary rounded-lg p-2">
            <div className="text-muted-foreground">Rate</div>
            <div className="font-semibold">{rateForDisplay.toFixed(2)}% / day</div>
          </div>
          <div className="bg-secondary rounded-lg p-2">
            <div className="text-muted-foreground">Daily Est.</div>
            <div className="font-semibold">${dailyForDisplay.toFixed(2)}</div>
          </div>
          <div className="bg-secondary rounded-lg p-2">
            <div className="text-muted-foreground">Per Hour Est.</div>
            <div className="font-semibold">${perMineForDisplay.toFixed(2)}</div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-2">Total Earnings</div>
        <div className="text-4xl font-heading font-bold gold-text mb-8">${earnings.toFixed(2)}</div>

        <Button size="lg" className="gap-2 w-full" disabled={!!activeSession || loading} onClick={handleMine}>
          <Zap className="h-5 w-5" />
          {loading ? "Starting..." : activeSession ? `Mining: ${cooldownText}` : "Start Mining"}
        </Button>

        {activeSession && (
          <div className="space-y-3 mt-3">
            {sessionReady ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Mining session complete. Collect ${activeSession.reward_amount.toFixed(2)} to move it into earnings.
                </p>
                <Button size="default" className="w-full" onClick={collectReward} disabled={loading}>
                  {loading ? "Collecting..." : "Collect Reward"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Mining in progress. Remaining time: {cooldownText}
                </p>
                <p className="text-xs text-muted-foreground">
                  Expected reward this session: ${activeSession.reward_amount.toFixed(2)}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-4 sm:p-6 max-w-xl mt-6">
        <h2 className="font-heading font-semibold mb-3">Important Points</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Only one mining session can stay active at a time.</p>
          <p>Last collected mining reward: ${lastMiningReward.toFixed(2)}</p>
        </div>

        <h3 className="font-heading font-semibold text-sm mt-5 mb-2">Level Rules</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
            <span className="text-muted-foreground">Level 1</span>
            <span className="font-medium text-primary">1.5% / day</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
            <span className="text-muted-foreground">
              Level 2 ({`$${LEVEL_REQUIREMENTS[2].minBalance.toLocaleString()}`} + {LEVEL_REQUIREMENTS[2].minReferrals} referrals)
            </span>
            <span className="font-medium text-primary">2.0% / day</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
            <span className="text-muted-foreground">
              Level 3 ({`$${LEVEL_REQUIREMENTS[3].minBalance.toLocaleString()}`} + {LEVEL_REQUIREMENTS[3].minReferrals} referrals)
            </span>
            <span className="font-medium text-primary">2.5% / day</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
            <span className="text-muted-foreground">
              Level 4 ({`$${LEVEL_REQUIREMENTS[4].minBalance.toLocaleString()}`} + {LEVEL_REQUIREMENTS[4].minReferrals} referrals)
            </span>
            <span className="font-medium text-primary">3.0% / day</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
            <span className="text-muted-foreground">
              Level 5 ({`$${LEVEL_REQUIREMENTS[5].minBalance.toLocaleString()}`} + {LEVEL_REQUIREMENTS[5].minReferrals} referrals)
            </span>
            <span className="font-medium text-primary">3.5% / day</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
