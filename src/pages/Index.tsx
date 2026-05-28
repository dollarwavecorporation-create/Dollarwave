import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Users, Zap, Globe, Clock } from "lucide-react";

const stats = [
  { value: "100K+", label: "Users" },
  { value: "1+", label: "Years Running" },
  { value: "25+", label: "Countries" },
  { value: "$50M+", label: "Payouts" },
];

const features = [
  { icon: TrendingUp, title: "Level Rewards", desc: "Daily mining return is level-based and unlocked with deposit + referral milestones." },
  { icon: Shield, title: "Secure Platform", desc: "Bank-grade encryption and secure auth flows protect your account and wallet activity." },
  { icon: Users, title: "Referral Bonus", desc: "When your referral makes a first deposit, you receive a bonus based on your level." },
  { icon: Zap, title: "Start Mining", desc: "Each mining session lasts 1 hour and pays daily rate / 24 into earnings." },
  { icon: Globe, title: "Global Access", desc: "Available globally with crypto wallet withdrawals and account-level tracking." },
  { icon: Clock, title: "Secure Processing", desc: "Withdrawal approvals are reviewed within 4-7 days for safer fund handling." },
];

const levels = [
  { level: 1 as const, color: "from-primary/15 to-primary/5", percentage: "1.5%" },
  { level: 2 as const, color: "from-primary/25 to-primary/8", percentage: "2.0%" },
  { level: 3 as const, color: "from-primary/35 to-primary/12", percentage: "2.5%" },
  { level: 4 as const, color: "from-primary/50 to-primary/15", percentage: "3.0%" },
  { level: 5 as const, color: "from-primary/70 to-primary/25", percentage: "3.5%" },
];

const faqs = [
  {
    q: "How do I increase my mining returns?",
    a: "Levels depend on both deposit and referrals: L2 ($500 + 8), L3 ($1,000 + 25), L4 ($2,500 + 50), L5 ($5,000 + 120).",
  },
  {
    q: "Can I sign up without a referral code?",
    a: "Yes. Referral code is optional during signup, and every user receives a unique referral code automatically.",
  },
  {
    q: "When can I mine again?",
    a: "One session runs for 1 hour. You cannot start another session while one is active.",
  },
  {
    q: "How does referral reward work?",
    a: "You get a reward only on your referral's first completed deposit, using the referral reward tier table and your current level.",
  },
];

const reviews = [
  { name: "Aisha Khan", country: "Pakistan", rating: 5, text: "Easy to use and reliable — my withdrawals were smooth and on time." },
  { name: "Emily Carter", country: "Canada", rating: 5, text: "Great platform. The referral bonus really helped grow my returns." },
  { name: "Rahul Sharma", country: "India", rating: 4, text: "Solid experience overall — customer support could be faster but funds settled fine." },
  { name: "Mehmet Yılmaz", country: "Turkey", rating: 5, text: "Trusted service with transparent rules. Mining sessions are predictable and fair." },
  { name: "Sara Ahmed", country: "Pakistan", rating: 5, text: "I love the level rewards model — it motivated me to grow my network." },
  { name: "Liam O'Connor", country: "Canada", rating: 4, text: "Good returns and clear UI. Waiting times for approvals are acceptable." },
  { name: "Priya Patel", country: "India", rating: 5, text: "Referral bonuses arrived correctly after the referee's first deposit — great implementation." },
  { name: "Ozan Demir", country: "Turkey", rating: 4, text: "Solid platform. Would like faster support responses but funds are secure." },
  { name: "Ava Thompson", country: "Canada", rating: 5, text: "Simple onboarding and steady returns. Highly recommended." },
  { name: "Fatima Hussain", country: "Pakistan", rating: 5, text: "Reliable and secure — the best option I've tried for passive mining returns." },
  { name: "Arjun Mehta", country: "India", rating: 4, text: "Good product-market fit. A few UX improvements would make it perfect." },
  { name: "Deniz Kaya", country: "Turkey", rating: 5, text: "Trusted by friends — payouts have been timely and accurate." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-heading font-bold gold-text">
            DollarWave
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(43_96%_56%/0.08),transparent_60%)]" />
        <div className="container relative px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-gold" />
              Trusted by 100,000+ investors worldwide
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-heading font-bold tracking-tight mb-6">
              Your Wealth,{" "}
              <span className="gold-text">Amplified</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Invest, mine, and earn with a level model based on deposit + referrals. Start at Level 1 and unlock higher returns as you grow.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 text-base glow-primary w-full sm:w-auto">
                  Start Earning <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="text-base w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 border-y border-border/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-heading font-bold gold-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Deposit Levels & Rewards</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Level is based on both your deposited balance and referral count. Mining reward per session is daily percentage divided by 24.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {levels.map((l, i) => (
              <motion.div
                key={l.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`glass-card rounded-xl p-6 bg-gradient-to-b ${l.color} glow-sm`}
              >
                <div className="text-sm text-primary font-medium mb-2">Level {l.level}</div>
                <div className="text-xl font-heading font-bold mb-1">{l.percentage} / day</div>
                <div className="text-sm text-muted-foreground mb-4">Mining rate</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Why DollarWave?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Built for reliability, designed for growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-heading font-bold">What Real Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Verified 4–5 star reviews from users across Canada, Pakistan, India, Turkey and more.</p>
          </div>

          <div className="relative">
            <style>{`
              .dw-reviews-slider { overflow: hidden; }
              .dw-reviews-track { display:flex; gap:1rem; align-items:stretch; will-change: transform; }
              .dw-reviews-track.animate { animation: dw-scroll 28s linear infinite; }
              .dw-reviews-track:hover { animation-play-state: paused; }
              .dw-review-card { min-width: 280px; flex-shrink: 0; }

              @keyframes dw-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }

              /* Responsive adjustments for smaller screens */
              @media (max-width: 1024px) {
                .dw-review-card { min-width: 240px; }
                .dw-reviews-track.animate { animation-duration: 26s; }
              }

              @media (max-width: 768px) {
                .dw-review-card { min-width: 220px; padding: 0.75rem; }
                .dw-reviews-track { gap: 0.75rem; }
                .dw-reviews-track.animate { animation-duration: 24s; }
                .dw-review-card .font-medium { font-size: 0.95rem; }
                .dw-review-card p { font-size: 0.95rem; line-height: 1.25; }
              }

              @media (max-width: 480px) {
                /* On very small screens, shrink cards for readability and avoid long lines */
                .dw-review-card { min-width: 200px; max-width: 260px; padding: 0.6rem; }
                .dw-reviews-track { gap: 0.5rem; padding-left: 0.5rem; }
                .dw-reviews-track.animate { animation-duration: 20s; }
                .dw-review-card .text-xs { font-size: 0.7rem; }
                .dw-review-card svg { height: 1rem; width: 1rem; }
                .dw-review-card p { white-space: normal; overflow-wrap: anywhere; word-break: break-word; }
              }
            `}</style>

            <div className="dw-reviews-slider">
              <div className="dw-reviews-track animate">
                {reviews.concat(reviews).map((r, idx) => (
                  <div key={idx} className="dw-review-card glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.country}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className={`h-4 w-4 ${i < r.rating ? "text-yellow-400" : "text-border/40"}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">FAQs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Quick answers to common questions before you get started.</p>
          </div>
          <div className="max-w-4xl mx-auto grid gap-4">
            {faqs.map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-xl p-5 sm:p-6"
              >
                <h3 className="font-heading font-semibold text-lg mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="glass-card rounded-2xl p-6 sm:p-8 md:p-12 text-center glow-primary max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of investors already growing their wealth on DollarWave.
            </p>
            <Link to="/register">
              <Button size="lg" className="gap-2 text-base">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">(c) 2024 DollarWave. All rights reserved.</div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
