import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Mail, Lock, Sparkles, User, Tag } from "lucide-react";
import { store, creditReferrer } from "@/lib/store";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EarnSpin Rewards — Spin, Win & Earn" },
      { name: "description", content: "Login to EarnSpin Rewards. Spin, play games and earn real cash rewards daily." },
    ],
  }),
  component: AuthScreen,
});

type AuthMode = "login" | "signup" | "forgot_password";

function AuthScreen() {
  const nav = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Read referral code from URL params (e.g. ?ref=ABCD1234) and auto-fill
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setMode("signup");
    }
  }, []);

  // Persistent login: if a user is already saved locally, skip login entirely.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = store.getUser();
    if (u && store.isOnboarded()) nav({ to: "/home" });
    else if (u) nav({ to: "/welcome" });
  }, [nav]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const firebaseAuth = auth();
    if (!firebaseAuth) {
      toast.error("Authentication service is not available.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
          throw new Error("Please fill in all fields.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        store.setUser({
          uid: userCredential.user.uid,
          name: name,
          phone: email,
        });

        await store.syncWithFirebase(userCredential.user.uid);

        // If referred by someone, credit the referrer 250 coins
        if (referralCode.trim()) {
          await creditReferrer(referralCode.trim().toUpperCase());
          toast.success("Referral applied! Your friend earned 250 coins 🎉");
        }

        toast.success("Account created successfully!");
        nav({ to: "/welcome" });

      } else if (mode === "login") {
        if (!email.trim() || !password.trim()) {
          throw new Error("Please fill in all fields.");
        }

        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);

        store.setUser({
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || "User",
          phone: email,
        });
        await store.syncWithFirebase(userCredential.user.uid);
        toast.success("Welcome back!");
        nav({ to: store.isOnboarded() ? "/home" : "/welcome" });

      } else if (mode === "forgot_password") {
        if (!email.trim()) {
          throw new Error("Please enter your email address.");
        }

        await sendPasswordResetEmail(firebaseAuth, email);
        toast.success("Password reset email sent! Check your inbox.");
        setMode("login");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col px-6 pt-12 pb-6">
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 rounded-full border-2 border-gold/60 flex items-center justify-center bg-background/40">
            <Sparkles className="h-8 w-8 text-gold" />
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">EarnSpin</h1>
          <p className="text-gold text-xs tracking-[0.4em] mt-1">REWARDS</p>
        </div>

        <form onSubmit={handleAuth} className="glass rounded-3xl p-5 mt-8 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              {mode === "login" && "Sign In"}
              {mode === "signup" && "Create Account"}
              {mode === "forgot_password" && "Reset Password"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === "login" && "Enter your email and password to continue"}
              {mode === "signup" && "Register to start earning rewards"}
              {mode === "forgot_password" && "Enter your email to receive a reset link"}
            </p>
          </div>

          <div className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-xs text-muted-foreground">Your Name</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl bg-input/70 border border-border px-3 py-2.5 text-sm focus-within:border-primary">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="flex-1 bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground">Email Address</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl bg-input/70 border border-border px-3 py-2.5 text-sm focus-within:border-primary">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
            </div>

            {(mode === "login" || mode === "signup") && (
              <div>
                <label className="text-xs text-muted-foreground">Password</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl bg-input/70 border border-border px-3 py-2.5 text-sm focus-within:border-primary">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            {mode === "signup" && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">Confirm Password</label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl bg-input/70 border border-border px-3 py-2.5 text-sm focus-within:border-primary">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">
                    Referral Code <span className="text-muted-foreground/50">(Optional)</span>
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl bg-input/70 border border-border px-3 py-2.5 text-sm focus-within:border-primary">
                    <Tag className="h-4 w-4 text-gold" />
                    <input
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Enter friend's referral code"
                      className="flex-1 bg-transparent outline-none tracking-widest font-mono text-gold"
                      maxLength={8}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : (
              mode === "login" ? "Sign In →" :
              mode === "signup" ? "Create Account →" :
              "Send Reset Link"
            )}
          </button>

          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground pt-2">
            {mode === "login" && (
              <>
                <button type="button" onClick={() => setMode("forgot_password")} className="hover:text-primary transition">
                  Forgot Password?
                </button>
                <button type="button" onClick={() => setMode("signup")} className="hover:text-primary transition">
                  Don't have an account? <span className="text-primary font-medium">Sign Up</span>
                </button>
              </>
            )}
            {mode === "signup" && (
              <button type="button" onClick={() => setMode("login")} className="hover:text-primary transition">
                Already have an account? <span className="text-primary font-medium">Sign In</span>
              </button>
            )}
            {mode === "forgot_password" && (
              <button type="button" onClick={() => setMode("login")} className="hover:text-primary transition">
                Remember your password? <span className="text-primary font-medium">Sign In</span>
              </button>
            )}
          </div>
        </form>

        <p className="text-[10px] text-center text-muted-foreground mt-auto pt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </PhoneFrame>
  );
}
