import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Sparkles, Disc3, Tv, Gamepad2, Users } from "lucide-react";
import { store } from "@/lib/store";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — EarnSpin Rewards" }] }),
  component: Welcome,
});

const slides = [
  { icon: Disc3, title: "Spin & Earn", text: "Spin the lucky wheel daily and win up to 30 coins per spin. Get 5 free spins every day!" },
  { icon: Gamepad2, title: "Play Games", text: "Play 5 exciting mini-games and earn coins based on your score. More skills, more coins!", color: "text-gold" },
  { icon: Sparkles, title: "Redeem Rewards", text: "Convert your coins into real money via Paytm, UPI, or Google Play. 1000 Coins = ₹10.", color: "text-neon-green" },
];

function Welcome() {
  const nav = useNavigate();
  const [step, setStep] = useState(-1); // -1 = intro

  if (step === -1) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="h-24 w-24 rounded-full border-2 border-gold/70 flex items-center justify-center bg-background/40 mb-6">
            <Sparkles className="h-10 w-10 text-gold" />
          </div>
          <p className="text-sm text-muted-foreground">Welcome to</p>
          <h1 className="text-4xl font-bold mt-1">EarnSpin</h1>
          <p className="text-gold text-xs tracking-[0.4em] mt-1">REWARDS</p>
          <p className="text-muted-foreground text-sm mt-4">Spin, Win & Earn<br/>Real Rewards Daily</p>

          <div className="grid grid-cols-4 gap-3 mt-8 w-full">
            {[
              { i: Disc3, l: "Spin & Win" },
              { i: Tv, l: "Watch Ads" },
              { i: Gamepad2, l: "Play Games" },
              { i: Users, l: "Refer & Earn" },
            ].map(({ i: I, l }) => (
              <div key={l} className="flex flex-col items-center gap-1">
                <div className="h-12 w-12 rounded-full glass flex items-center justify-center">
                  <I className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={() => setStep(0)} className="w-full rounded-xl bg-gold text-gold-foreground font-semibold py-3.5 glow-gold">
            Get Started →
          </button>
        </div>
      </PhoneFrame>
    );
  }

  const s = slides[step];
  const Icon = s.icon;
  const last = step === slides.length - 1;

  const next = () => {
    if (last) {
      store.setOnboarded();
      nav({ to: "/home" });
    } else setStep(step + 1);
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className={`h-32 w-32 rounded-full border-2 border-primary/40 flex items-center justify-center bg-background/30 mb-8`}>
          <Icon className={`h-12 w-12 ${s.color ?? "text-primary"}`} />
        </div>
        <h2 className="text-3xl font-bold">{s.title}</h2>
        <p className="text-muted-foreground text-sm mt-4 max-w-xs">{s.text}</p>
      </div>
      <div className="px-6 pb-6">
        <div className="flex justify-center gap-1.5 mb-4">
          {slides.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`} />
          ))}
        </div>
        <button onClick={next} className="w-full rounded-xl bg-gold text-gold-foreground font-semibold py-3.5 glow-gold">
          {last ? "Get Started →" : "Next →"}
        </button>
      </div>
    </PhoneFrame>
  );
}
