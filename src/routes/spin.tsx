import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Coins, Tv } from "lucide-react";
import { store, getUserId } from "@/lib/store";
import { showRewarded, isAdMobAvailable } from "@/lib/admob";
import {
  getDailySpinState,
  consumeSpin,
  addBonusSpin,
  formatRemaining,
  type DailySpinState,
} from "@/lib/dailySpins";

export const Route = createFileRoute("/spin")({
  head: () => ({ meta: [{ title: "Spin & Earn — EarnSpin Rewards" }] }),
  component: Spin,
});

const segments = [
  { value: 10, color: "#3b82f6" },
  { value: 10, color: "#a855f7" },
  { value: 20, color: "#f59e0b" },
  { value: 20, color: "#ec4899" },
  { value: 30, color: "#ec4899" },
  { value: 10, color: "#22c55e" },
  { value: 20, color: "#22c55e" },
  { value: 10, color: "#f59e0b" },
];

function Spin() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [state, setState] = useState<DailySpinState>({
    spinsLeft: 0, bonusSpins: 0, resetAt: null, msUntilReset: 0,
  });
  const [loaded, setLoaded] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [loadingAd, setLoadingAd] = useState(false);
  const [adMsg, setAdMsg] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getDailySpinState(getUserId());
      if (!cancelled) { setState(s); setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const msRemaining = state.resetAt ? Math.max(0, state.resetAt.getTime() - now) : 0;
  const spinsLeft = state.spinsLeft;
  const locked = loaded && spinsLeft <= 0 && msRemaining > 0;

  // Auto-refresh when timer expires.
  useEffect(() => {
    if (loaded && spinsLeft <= 0 && state.resetAt && msRemaining <= 0) {
      getDailySpinState(getUserId()).then(setState);
    }
  }, [msRemaining, loaded, spinsLeft, state.resetAt]);

  const spin = async () => {
    if (spinning || spinsLeft <= 0) return;
    setSpinning(true);
    setLastWin(null);
    const pickIndex = () => {
      const rareIdx = segments.findIndex((s) => s.value === 30);
      if (Math.random() < 0.05) return rareIdx;
      let i = Math.floor(Math.random() * segments.length);
      if (i === rareIdx) i = (i + 1) % segments.length;
      return i;
    };
    const idx = pickIndex();
    const seg = 360 / segments.length;
    const target = 360 * 6 + (360 - (idx * seg + seg / 2));
    const next = rotation + target;
    setRotation(next);

    // Optimistically decrement spin count immediately so UI updates.
    setState((s) => ({
      ...s,
      spinsLeft: Math.max(0, s.spinsLeft - 1),
      bonusSpins: s.bonusSpins > 0 ? s.bonusSpins - 1 : 0,
    }));

    // Persist to Firestore in the background — never block the reward.
    consumeSpin(getUserId())
      .then((newState) => setState(newState))
      .catch((e) => console.warn("[spin] consumeSpin failed", e));

    // Grant reward after wheel animation completes.
    setTimeout(() => {
      setSpinning(false);
      store.addCoins(segments[idx].value);
      store.incrementSpinForReferral();
      setLastWin(segments[idx].value);
    }, 4200);
  };

  const seg = 360 / segments.length;
  const gradient = `conic-gradient(${segments.map((s, i) => `${s.color} ${i * seg}deg ${(i + 1) * seg}deg`).join(",")})`;

  return (
    <AppLayout>
      <div className="px-5 pt-8 text-center">
        <h1 className="text-2xl font-bold">Spin & Earn</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Spins Left: <span className="text-foreground font-semibold">{spinsLeft}</span>
        </p>
        {locked && (
          <p className="text-xs text-muted-foreground mt-1">
            Next free spins in <span className="text-gold font-semibold">{formatRemaining(msRemaining)}</span>
          </p>
        )}

        <div className="relative mx-auto mt-8 h-72 w-72">
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-gold" />
          <div
            className="h-full w-full rounded-full border-4 border-gold shadow-[0_0_40px_oklch(0.78_0.17_75/0.4)] transition-transform duration-[4000ms] ease-out relative"
            style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((s, i) => {
              const angle = i * seg + seg / 2;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 text-white font-bold text-lg"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-100px) rotate(-${angle}deg)`,
                  }}
                >
                  {s.value}
                </div>
              );
            })}
            <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-background border-2 border-gold flex items-center justify-center">
              <span className="text-gold text-xs font-bold">SPIN</span>
            </div>
          </div>
        </div>

        {lastWin !== null && (
          <p className="mt-4 text-gold font-semibold">🎉 You won {lastWin} coins!</p>
        )}

        <button
          onClick={spin}
          disabled={spinning || spinsLeft <= 0 || !loaded}
          className="mt-6 w-full rounded-xl bg-gold text-gold-foreground font-bold py-3.5 glow-gold disabled:opacity-50"
        >
          <Coins className="h-4 w-4 inline mr-2" /> Spin Now
        </button>

        <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#a855f7]" />10 coins</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f59e0b]" />30 coins</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#3b82f6]" />20 coins</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ec4899]" />Rare reward</span>
        </div>
      </div>
    </AppLayout>
  );
}
