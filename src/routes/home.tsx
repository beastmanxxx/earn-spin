import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CoinBadge } from "@/components/CoinBadge";
import { Disc3, Tv, Gamepad2, Gift, Users, Coins, IndianRupee, UserPlus } from "lucide-react";
import { store, useCoins, useReferral, getUserId } from "@/lib/store";
import { ADMOB } from "@/lib/admob";
import { getDailyRewardState, claimDailyReward, DAILY_REWARD_COINS, formatRemaining } from "@/lib/dailyReward";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — EarnSpin Rewards" }] }),
  component: Home,
});

const features = [
  { to: "/spin", icon: Disc3, title: "Spin & Earn", sub: "Spin to win coins", tint: "from-primary/30 to-primary/10", color: "text-primary" },
  { to: "/games", icon: Gamepad2, title: "Games", sub: "Play & earn coins", tint: "from-neon-green/25 to-neon-green/5", color: "text-neon-green" },
  { to: "/home", icon: Gift, title: "Daily Reward", sub: "Claim free coins", tint: "from-neon-pink/25 to-neon-pink/5", color: "text-neon-pink" },
  { to: "/profile", icon: Users, title: "Refer & Earn", sub: "+250 coins/refer", tint: "from-neon-cyan/25 to-neon-cyan/5", color: "text-neon-cyan" },
] as const;

function Home() {
  const user = typeof window !== "undefined" ? store.getUser() : null;
  const coins = useCoins();
  const referral = useReferral();
  const [canClaim, setCanClaim] = useState(false);
  const [msLeft, setMsLeft] = useState(0);
  const [claiming, setClaiming] = useState(false);

  const refresh = async () => {
    const s = await getDailyRewardState(getUserId());
    setCanClaim(s.canClaim);
    setMsLeft(s.msRemaining);
  };

  useEffect(() => {
    refresh();
    const t = setInterval(() => {
      setMsLeft((m) => {
        const next = Math.max(0, m - 1000);
        if (m > 0 && next === 0) setCanClaim(true);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const claim = async () => {
    if (!canClaim || claiming) return;
    setClaiming(true);
    const res = await claimDailyReward(getUserId());
    if (res.ok) {
      store.addCoins(DAILY_REWARD_COINS);
    }
    await refresh();
    setClaiming(false);
  };

  return (
    <AppLayout>
      <div className="px-5 pt-8 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Hello,</p>
            <h1 className="text-2xl font-bold">{user?.name || "Player"}</h1>
          </div>
          <CoinBadge />
        </div>

        <div className="glass rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Coins</p>
            <p className="text-4xl font-extrabold text-gold mt-1">{coins}</p>
            <p className="text-[11px] text-muted-foreground mt-1">1000 Coins = ₹10</p>
          </div>
          <div className="h-16 w-16 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center">
            <Coins className="h-7 w-7 text-gold" />
          </div>
        </div>

        <button
          onClick={claim}
          disabled={!canClaim || claiming}
          className={`w-full rounded-xl glass border ${canClaim ? "border-neon-pink/40 text-neon-pink" : "border-neon-green/40 text-neon-green"} py-3 text-sm font-medium disabled:opacity-70`}
        >
          {claiming
            ? "Claiming…"
            : canClaim
              ? `🎁 Daily reward available! Tap to claim (+${DAILY_REWARD_COINS})`
              : `✓ Claimed · Next in ${formatRemaining(msLeft)}`}
        </button>
        <div className="rounded-xl glass border border-dashed border-gold/30 py-2 text-center text-[10px] text-muted-foreground">Ad · Banner ({ADMOB.banner})</div>


        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Features</h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.title} to={f.to} className={`glass rounded-2xl p-4 bg-gradient-to-br ${f.tint}`}>
                  <div className="h-10 w-10 rounded-xl bg-background/40 flex items-center justify-center mb-3">
                    <Icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground">{f.sub}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Today's Activity</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-2xl p-3 text-center">
              <Coins className="h-5 w-5 text-neon-cyan mx-auto mb-1" />
              <p className="font-bold">{coins}</p>
              <p className="text-[10px] text-muted-foreground">Total Coins</p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <IndianRupee className="h-5 w-5 text-neon-green mx-auto mb-1" />
              <p className="font-bold">₹{(coins / 100).toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Est. Value</p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <UserPlus className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-bold">{referral.successful}</p>
              <p className="text-[10px] text-muted-foreground">Referrals</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
