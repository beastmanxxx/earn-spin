import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Sparkles } from "lucide-react";
import { store, getUserId } from "@/lib/store";
import { claimWelcomeBonus, WELCOME_BONUS_COINS } from "@/lib/welcomeBonus";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify OTP — EarnSpin Rewards" }] }),
  component: Verify,
});

function Verify() {
  const nav = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [seconds, setSeconds] = useState(57);
  const [error, setError] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const pending = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("pending_user") || "{}") : {};
  const sentOtp = typeof window !== "undefined" ? sessionStorage.getItem("pending_otp") || "" : "";

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const setAt = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError("");
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const resend = () => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem("pending_otp", otp);
    sessionStorage.setItem("pending_otp_exp", String(Date.now() + 5 * 60 * 1000));
    setSeconds(57);
    setError("A new OTP has been sent.");
  };

  const verify = async () => {
    const code = digits.join("");
    if (code.length !== 6) return;
    const exp = Number(sessionStorage.getItem("pending_otp_exp") || "0");
    if (Date.now() > exp) { setError("OTP expired. Please resend."); return; }
    if (code !== sentOtp) { setError("Invalid OTP. Please try again."); return; }
    sessionStorage.removeItem("pending_otp");
    sessionStorage.removeItem("pending_otp_exp");
    const phone = pending.phone || "";
    store.setUser({ name: pending.name || "Guest", phone });
    // One-time welcome bonus tied to the account (phone), enforced in Firestore.
    const granted = await claimWelcomeBonus(phone, getUserId());
    if (granted) store.addCoins(WELCOME_BONUS_COINS);
    store.setOnboarded();
    store.startReferral();
    nav({ to: "/welcome" });
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col px-6 pt-10">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full border-2 border-primary/60 flex items-center justify-center bg-background/40">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-3 text-2xl font-bold">Verify OTP</h1>
          <p className="text-xs text-muted-foreground mt-2">6-digit code sent to</p>
          <p className="text-primary text-sm">+91 {pending.phone ? `${pending.phone.slice(0,3)} XXXX ${pending.phone.slice(-3)}` : "945 XXXX 873"}</p>
        </div>

        <div className="glass rounded-xl mt-6 px-4 py-3 text-xs text-center text-muted-foreground">
          Your verification code: <span className="text-primary font-mono tracking-widest">{sentOtp}</span>
        </div>

        <div className="flex justify-between gap-2 mt-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              className="w-12 h-14 rounded-xl glass text-center text-xl font-semibold outline-none focus:border-primary"
            />
          ))}
        </div>

        {error && <p className="text-center text-xs text-destructive mt-3">{error}</p>}

        <p className="text-center text-xs text-muted-foreground mt-4">
          {seconds > 0 ? (
            <>Resend OTP in <span className="text-foreground">{seconds}s</span></>
          ) : (
            <button onClick={resend} className="text-primary underline">Resend OTP</button>
          )}
        </p>

        <button
          onClick={verify}
          className="mt-6 w-full rounded-xl bg-primary/70 hover:bg-primary text-primary-foreground font-semibold py-3 transition"
        >
          Verify & Continue →
        </button>

        <button onClick={() => nav({ to: "/" })} className="mt-3 text-center text-xs text-muted-foreground underline">
          Change phone number?
        </button>
      </div>
    </PhoneFrame>
  );
}
