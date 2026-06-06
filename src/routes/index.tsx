import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Gamepad2, Coins, Share2, Menu, X } from "lucide-react";
import { store } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EarnSpin Rewards — Spin, Play, & Win Real Cash Daily" },
      { name: "description", content: "Join EarnSpin Rewards! Spin the wheel, play exciting mini-games, and refer friends to earn coins. Redeem your coins instantly for real cash via Paytm, UPI, and Google Play." },
      { name: "keywords", content: "EarnSpin, rewards, spin to win, play games, earn money, referral codes, real cash, daily rewards" }
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // If a user visits with a referral code, capture it.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        setReferralCode(ref.toUpperCase());
      }
      
      // Auto redirect if already logged in and onboarded
      const u = store.getUser();
      if (u && store.isOnboarded()) {
        nav({ to: "/home" });
      }
    }
  }, [nav]);

  const handleCTA = () => {
    if (referralCode) {
      nav({ to: `/auth`, search: { ref: referralCode } as any });
    } else {
      nav({ to: "/auth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full border border-gold/60 flex items-center justify-center bg-background/80">
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <span className="font-bold text-lg tracking-tight">EarnSpin</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">How it Works</a>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth" className="text-sm font-medium hover:text-primary transition">Log in</Link>
            <button onClick={handleCTA} className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition">
              Start Earning
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-b border-border/50 absolute top-16 w-full flex flex-col p-4 gap-4 animate-in slide-in-from-top-2">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/5">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/5">How it Works</a>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/5">Contact</Link>
            <hr className="border-border/50" />
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/5">Log in</Link>
            <button onClick={handleCTA} className="bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm font-bold mt-2">
              Start Earning
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="h-3 w-3" />
          Real Cash Rewards Delivered Daily
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Spin, Play, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-400">Earn Real Money</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Welcome to EarnSpin Rewards, the ultimate platform where your time is valued. Play exciting mini-games, complete daily spins, and invite friends to earn coins. Redeem them instantly to your wallet.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button onClick={handleCTA} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
            Create an Account <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        
        {referralCode && (
          <p className="mt-6 text-sm font-medium text-neon-cyan bg-neon-cyan/10 px-4 py-2 rounded-lg border border-neon-cyan/20 inline-flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Referral Code {referralCode} Applied! Sign up to claim your bonus.
          </p>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Why choose EarnSpin?</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">We've built a platform that consistently rewards you for simply having fun.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Sparkles className="h-8 w-8 text-gold" />}
              title="Daily Free Spins"
              description="Log in every day to claim your free spins. Get up to 5 spins every 24 hours with massive coin multipliers."
            />
            <FeatureCard 
              icon={<Gamepad2 className="h-8 w-8 text-neon-cyan" />}
              title="Exciting Mini Games"
              description="Play interactive games designed to test your reflexes while rewarding you with massive coin drops."
            />
            <FeatureCard 
              icon={<Coins className="h-8 w-8 text-neon-green" />}
              title="Instant Cash Redemptions"
              description="Convert your hard-earned coins into real-world cash instantly via UPI, Paytm, or Google Play Gift Cards."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">It takes just minutes to get your first payout</h2>
              <p className="text-muted-foreground mt-4">We've made our app simple, transparent, and rewarding.</p>
            </div>
            
            <div className="space-y-6">
              <Step number="01" title="Sign Up for Free" text="Create an account using your email. New users get a welcome bonus immediately!" />
              <Step number="02" title="Play & Spin" text="Use your daily spins and play our mini-games to start accumulating coins in your wallet." />
              <Step number="03" title="Refer Friends" text="Share your unique referral link. Earn 250 coins automatically when they complete their tasks." />
              <Step number="04" title="Withdraw Funds" text="Once you reach the minimum balance of 3000 coins (₹30), hit withdraw and get paid instantly." />
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-neon-cyan/20 blur-3xl -z-10 rounded-full"></div>
            <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <Share2 className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-bold text-lg">Referral Program</h3>
                  <p className="text-sm text-muted-foreground">The fastest way to earn.</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Our referral program is designed for massive scale. Every user gets a unique code. When your friend signs up, plays a game, and completes 5 spins, you get a 250 coin reward dropped straight into your wallet. There is no limit to how many friends you can invite.
              </p>
              <button onClick={handleCTA} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-semibold transition">
                Get your Invite Link
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Secure & Transparent</h2>
          <p className="text-muted-foreground">
            We value your privacy and security. Our app uses advanced encryption to protect your data. All payouts are verified and processed through secure, regulated payment gateways. EarnSpin does not require you to pay any money to play.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 pt-16 pb-8 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full border border-gold/60 flex items-center justify-center bg-background">
                <Sparkles className="h-3 w-3 text-gold" />
              </div>
              <span className="font-bold text-lg">EarnSpin</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              The premium rewards platform offering daily spins, interactive games, and instant real cash payouts.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition">Contact Support</Link></li>
              <li><a href="#how-it-works" className="hover:text-primary transition">How it Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/privacy-policy" className="hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EarnSpin Rewards. All rights reserved.</p>
          <p className="mt-2 text-[10px] opacity-60">This platform operates globally. Google, Google Play, Paytm, and UPI are trademarks of their respective owners and are not affiliated with EarnSpin.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 rounded-3xl border border-white/5 hover:bg-white/[0.02] transition">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, text }: { number: string, title: string, text: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 mt-1">
        <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md">
          {number}
        </span>
      </div>
      <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{text}</p>
      </div>
    </div>
  );
}
