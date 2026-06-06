import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CoinBadge } from "@/components/CoinBadge";
import { Sparkles, Users, Receipt, Shield, Star, LogOut, Copy, X, Check, ShieldCheck, Share2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { store, useCoins, useReferral, getUserId, getMyReferralCode } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — EarnSpin Rewards" }] }),
  component: Profile,
});

function Profile() {
  const nav = useNavigate();
  const user = typeof window !== "undefined" ? store.getUser() : null;
  const coins = useCoins();
  const referral = useReferral();
  const [show, setShow] = useState<"privacy" | "refer" | null>(null);
  const [myCode, setMyCode] = useState("--------");

  useEffect(() => { store.markReferralTask("profile"); }, []);

  // Load unique referral code from Firebase
  useEffect(() => {
    const uid = getUserId();
    if (!uid) return;
    getMyReferralCode(uid).then(setMyCode);
  }, []);

  const logout = () => {
    store.clear();
    nav({ to: "/" });
  };

  const shareLink = typeof window !== "undefined"
    ? `${window.location.origin}/?ref=${myCode}`
    : `https://earnspin.app/?ref=${myCode}`;

  const handleShare = async () => {
    const text = `🎰 Join EarnSpin Rewards & earn real money!\nSpin daily, play games, and redeem coins as cash.\n\nUse my referral code *${myCode}* when signing up!\n👉 ${shareLink}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "EarnSpin Rewards", text, url: shareLink });
      } catch { /* user cancelled */ }
    } else {
      // Fallback: open WhatsApp
      const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(wa, "_blank");
    }
  };

  return (
    <AppLayout>
      <div className="px-5 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <CoinBadge />
        </div>

        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="h-14 w-14 rounded-full border-2 border-primary/50 flex items-center justify-center bg-background/40">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold">{user?.name || "Player"}</p>
            <p className="text-xs text-muted-foreground">{user?.phone || "guest"}</p>
            <span className="inline-flex items-center gap-1 text-xs text-gold mt-1">🪙 {coins} Coins</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-neon-cyan font-bold text-lg">{referral.total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-neon-green font-bold text-lg">{referral.successful}</p>
            <p className="text-[10px] text-muted-foreground">Successful</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-gold font-bold text-lg">{referral.pending}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-3 text-center">
          <p className="text-[11px] text-muted-foreground">Referral coins earned</p>
          <p className="text-gold font-bold text-lg mt-0.5">🪙 {referral.coinsEarned}</p>
        </div>

        {/* Referral Code Card */}
        <div className="glass rounded-2xl p-4 text-center space-y-3">
          <p className="text-xs text-muted-foreground">My Referral Code</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl font-bold tracking-[0.3em] text-neon-cyan">{myCode}</p>
            <button
              onClick={() => { navigator.clipboard?.writeText(myCode); }}
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-neon-cyan transition"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">Share code & earn 250 coins per referral</p>

          {/* Share to Friend Button */}
          <button
            onClick={handleShare}
            className="w-full rounded-xl bg-gradient-to-r from-neon-cyan/80 to-primary/80 text-background font-semibold py-3 flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <Share2 className="h-4 w-4" />
            Share to Friend
          </button>
        </div>

        <div className="space-y-2">
          <Row icon={Users} label="Refer & Earn" color="text-neon-cyan" onClick={() => setShow("refer")} />
          <Row icon={Receipt} label="Transaction History" color="text-primary" />
          <Row icon={Shield} label="Privacy Policy" color="text-neon-green" onClick={() => setShow("privacy")} />
          <Row icon={Star} label="Rate Us" color="text-gold" />
          <Link to="/admin" className="w-full glass rounded-2xl p-3.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-background/40 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-neon-cyan" />
            </div>
            <span className="flex-1 text-left font-medium">Rajeev Admin Withdrawal</span>
          </Link>
          <Row icon={LogOut} label="Logout" color="text-destructive" onClick={logout} />
        </div>

        <p className="text-center text-[11px] text-muted-foreground pt-2">EarnSpin Rewards v1.0.0</p>
      </div>

      {show === "refer" && <ReferSheet onClose={() => setShow(null)} myCode={myCode} />}
      {show === "privacy" && <PrivacySheet onClose={() => setShow(null)} />}
    </AppLayout>
  );
}

function Row({ icon: Icon, label, color, onClick }: { icon: typeof Users; label: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full glass rounded-2xl p-3.5 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-background/40 flex items-center justify-center">
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <span className={`flex-1 text-left font-medium ${label === "Logout" ? "text-destructive" : ""}`}>{label}</span>
    </button>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[430px] max-h-[80vh] rounded-t-3xl glass p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2">
            <Shield className="h-4 w-4 text-neon-green" />{title}
          </h3>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {children}
        <button onClick={onClose} className="mt-4 w-full rounded-xl bg-neon-green text-background font-semibold py-3">Close</button>
      </div>
    </div>
  );
}

function ReferSheet({ onClose, myCode }: { onClose: () => void; myCode: string }) {
  const r = useReferral();
  // watchAd removed from steps
  const steps: { key: keyof typeof r.tasks; label: string }[] = [
    { key: "signup", label: "Complete signup" },
    { key: "spin5", label: `Complete 5 spins (${Math.min(r.spinCount, 5)}/5)` },
    { key: "game", label: "Play at least one game" },
    { key: "wallet", label: "Visit Wallet" },
    { key: "profile", label: "Visit Profile" },
  ];

  const shareLink = typeof window !== "undefined"
    ? `${window.location.origin}/?ref=${myCode}`
    : `https://earnspin.app/?ref=${myCode}`;

  const handleShare = async () => {
    const text = `🎰 Join EarnSpin Rewards & earn real money!\nSpin daily, play games, and redeem coins as cash.\n\nUse my referral code *${myCode}* when signing up!\n👉 ${shareLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: "EarnSpin Rewards", text, url: shareLink }); } catch { }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <Sheet title="Invite Friends" onClose={onClose}>
      <div className="text-center">
        <div className="h-20 w-20 mx-auto rounded-full border-2 border-neon-cyan/50 flex items-center justify-center bg-background/40">
          <Users className="h-8 w-8 text-neon-cyan" />
        </div>
        <p className="text-sm mt-3">Earn 250 coins when a friend joins with your code and completes all required actions.</p>
        <div className="mt-4 glass rounded-xl py-4 flex items-center justify-center gap-3">
          <span className="text-2xl font-bold tracking-[0.3em] text-neon-cyan">{myCode}</span>
          <button onClick={() => navigator.clipboard?.writeText(myCode)} className="text-xs flex items-center gap-1 text-muted-foreground">
            <Copy className="h-3 w-3" />Copy
          </button>
        </div>

        <div className="mt-4 glass rounded-xl p-3 text-left space-y-2">
          <p className="text-xs text-muted-foreground text-center">Referral progress</p>
          {steps.map((s) => {
            const done = r.tasks[s.key];
            return (
              <div key={s.key} className="flex items-center gap-2 text-sm">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${done ? "bg-neon-green/20 text-neon-green" : "bg-background/40 text-muted-foreground border border-border"}`}>
                  {done ? <Check className="h-3 w-3" /> : "•"}
                </span>
                <span className={done ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
              </div>
            );
          })}
          <p className="text-[11px] text-center pt-2">
            {r.credited ? (
              <span className="text-neon-green">✓ Reward of 250 coins credited</span>
            ) : (
              <span className="text-gold">Reward unlocks automatically once all steps complete</span>
            )}
          </p>
        </div>

        <button
          onClick={handleShare}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-neon-cyan/80 to-primary/80 text-background font-semibold py-3 flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Referral Link
        </button>
      </div>
    </Sheet>
  );
}

function PrivacySheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Privacy Policy" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <h4 className="text-neon-cyan font-semibold">EarnSpin Rewards — Privacy Policy</h4>
        <p className="text-xs text-muted-foreground">Last updated: May 2026</p>
        <Section title="1. Information We Collect">
          We collect username, profile data, coin balance, transaction history, referral activity and app usage stored locally.
        </Section>
        <Section title="2. How We Use Your Information">
          To operate EarnSpin Rewards, process redemptions (Paytm, UPI, Google Play), calculate referral bonuses, and improve features.
        </Section>
        <Section title="3. Data Storage">
          All your data is stored locally on your device. We do not upload personal data without your consent.
        </Section>
        <Section title="4. Children's Privacy">
          EarnSpin Rewards is intended for users aged 13 and above.
        </Section>
        <Section title="5. Contact">
          Questions? support@earnspin.app
        </Section>
      </div>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-neon-green">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{children}</p>
    </div>
  );
}
