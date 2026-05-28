import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LayoutDashboard, ArrowDownToLine, TrendingUp, ArrowUpFromLine, Users, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/deposit", icon: ArrowDownToLine, label: "Deposit" },
  { to: "/dashboard/earnings", icon: TrendingUp, label: "Earnings" },
  { to: "/dashboard/withdraw", icon: ArrowUpFromLine, label: "Withdraw" },
  { to: "/dashboard/referrals", icon: Users, label: "Referrals" },
];

const DashboardLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const handle = async () => {
        const user = session?.user ?? null;
        if (!user) {
          setUser(null);
          navigate("/login");
          setLoading(false);
          return;
        }

        // Check if the user's profile is banned; if so, sign them out and notify.
        try {
          const { data: profile } = await supabase.from('profiles').select('is_banned').eq('user_id', user.id).single();
          if (profile?.is_banned) {
            await supabase.auth.signOut();
            toast.error('Your account has been banned by an administrator. Contact support.');
            navigate('/login');
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore lookup errors and allow session
        }

        setUser(user);
        setLoading(false);
      };
      void handle();
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const init = async () => {
        const user = session?.user ?? null;
        if (!user) {
          setUser(null);
          navigate('/login');
          setLoading(false);
          return;
        }

        try {
          const { data: profile } = await supabase.from('profiles').select('is_banned').eq('user_id', user.id).single();
          if (profile?.is_banned) {
            await supabase.auth.signOut();
            toast.error('Your account has been banned by an administrator. Contact support.');
            navigate('/login');
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore lookup errors
        }

        setUser(user);
        setLoading(false);
      };
      void init();
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden relative">
      {/* Decorative background blobs for subtle depth */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-28 w-72 h-72 rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-xl opacity-60" />
        <div className="absolute -right-40 bottom-6 w-96 h-96 rounded-full bg-gradient-to-bl from-accent/15 to-transparent blur-xl opacity-50" />
      </div>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/30">
        <div className="p-6">
          <Link to="/" className="text-xl font-heading font-bold gold-text">DollarWave</Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === item.to
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-50 flex w-full min-w-0 items-center justify-between p-4 border-b border-border/50 bg-card/60 backdrop-blur-sm">
          <Link to="/" className="text-lg font-heading font-bold gold-text">DollarWave</Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="shrink-0 text-foreground">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-b border-border/50 bg-card/50 backdrop-blur-xl z-40 w-full">
            <nav className="p-3 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                    location.pathname === item.to ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground w-full">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
