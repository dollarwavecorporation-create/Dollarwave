import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface Withdrawal {
  id: string;
  amount: number;
  wallet_address: string;
  source: "balance" | "earnings";
  status: string;
  approval_due_at: string | null;
  approval_note: string | null;
  created_at: string;
}

const Withdraw = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [source, setSource] = useState<"balance" | "earnings">("earnings");
  const [balance, setBalance] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, earnings")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile) {
        setBalance(Number(profile.balance) || 0);
        setEarnings(Number(profile.earnings) || 0);
      }

      const { data } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setWithdrawals(data as unknown as Withdrawal[]);
    };
    fetchData();
  }, [user.id]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    const available = source === "balance" ? balance : earnings;

    if (num <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (num < 50) {
      toast.error("Minimum withdrawal amount is $50");
      return;
    }
    if (num > available) {
      toast.error(`Insufficient ${source === "balance" ? "deposit balance" : "earnings"} funds`);
      return;
    }
    if (!wallet.trim()) {
      toast.error("Enter your wallet address");
      return;
    }
    setLoading(true);
    // Use RPC to atomically create withdrawal and deduct funds server-side
    const { data, error } = await supabase.rpc("withdraw_request", {
      p_amount: num,
      p_source: source,
      p_wallet_address: wallet.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Withdrawal request failed");
    } else {
      toast.success("Withdrawal submitted. Approval can take 4-7 days.");
      // rpc returns an array of rows (single row expected)
      const row = Array.isArray(data) ? data[0] : data;
      setWithdrawals(prev => [row as unknown as Withdrawal, ...prev]);
      try {
        const email = row?.user_email || user.email;
        await fetch("/api/send-withdrawal-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, amount: num, source, wallet: wallet.trim() }),
        });
      } catch (e) {
        toast.error("Confirmation email failed to send");
      }
      if (source === "balance") {
        setBalance(prev => Math.max(prev - num, 0));
      } else {
        setEarnings(prev => Math.max(prev - num, 0));
      }
      setAmount("");
      setWallet("");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-1">Withdraw</h1>
      <p className="text-muted-foreground mb-8">Withdraw from deposit balance or earnings to your crypto wallet.</p>

      <div className="glass-card rounded-xl p-4 sm:p-6 max-w-md mb-8">
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <Label>Withdraw From</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                className={`rounded-lg border px-3 py-2 text-sm ${
                  source === "balance" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
                onClick={() => setSource("balance")}
              >
                Deposit (${balance.toFixed(2)})
              </button>
              <button
                type="button"
                className={`rounded-lg border px-3 py-2 text-sm ${
                  source === "earnings" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
                onClick={() => setSource("earnings")}
              >
                Earnings (${earnings.toFixed(2)})
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input id="amount" type="number" min={50} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" required />
          </div>
          <div>
            <Label htmlFor="wallet">Crypto Wallet Address</Label>
            <Input id="wallet" value={wallet} onChange={e => setWallet(e.target.value)} placeholder="Paste your wallet address" required />
          </div>
          <p className="text-xs text-muted-foreground">Approval can take 4-7 days.</p>
          <p className="text-xs text-muted-foreground">A withdrawal fee of <strong>5%</strong> is deducted from the requested amount; minimum withdrawal is <strong>$50</strong>.</p>
          {Number(amount) > 0 && (
            <div className="text-sm text-muted-foreground">
              <div>Fee (5%): ${((Number(amount) * 0.05) || 0).toFixed(2)}</div>
              <div>Amount to be sent: ${Math.max(Number(amount) - (Number(amount) * 0.05), 0).toFixed(2)}</div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Request Withdrawal"}
          </Button>
        </form>
      </div>

      {withdrawals.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-heading font-semibold mb-4">Withdrawal History</h2>
          <div className="space-y-3">
            {withdrawals.map(w => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <div className="font-medium">${Number(w.amount).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground capitalize">{w.source} withdrawal</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-[200px]">{w.wallet_address}</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${w.status === "completed" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                    {w.status}
                  </span>
                  {w.approval_due_at && (
                    <div className="text-xs text-muted-foreground mt-1">Due: {new Date(w.approval_due_at).toLocaleDateString()}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">{new Date(w.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
