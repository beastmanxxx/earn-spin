import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type User = { uid?: string; name: string; phone: string };

const KEYS = {
  user: "earnspin_user",
  coins: "earnspin_coins",
  onboarded: "earnspin_onboarded",
  referral: "earnspin_referral",
  processedApprovals: "earnspin_processed_approvals",
};

export function getUserId(): string {
  if (typeof window === "undefined") return "";
  const u = store.getUser();
  return u?.uid ?? "";
}

export function getProcessedApprovals(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEYS.processedApprovals) || "[]"); } catch { return []; }
}
export function markApprovalProcessed(id: string) {
  const list = getProcessedApprovals();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(KEYS.processedApprovals, JSON.stringify(list));
  }
}

export const REFERRAL_REWARD = 250;
export type ReferralTaskKey = "signup" | "spin5" | "game" | "watchAd" | "wallet" | "profile";

export type ReferralState = {
  tasks: Record<ReferralTaskKey, boolean>;
  spinCount: number;
  credited: boolean;
  total: number;
  successful: number;
  coinsEarned: number;
};

const DEFAULT_REFERRAL: ReferralState = {
  tasks: { signup: false, spin5: false, game: false, watchAd: false, wallet: false, profile: false },
  spinCount: 0,
  credited: false,
  total: 0,
  successful: 0,
  coinsEarned: 0,
};

function readReferral(): ReferralState {
  if (typeof window === "undefined") return DEFAULT_REFERRAL;
  const raw = localStorage.getItem(KEYS.referral);
  if (!raw) return DEFAULT_REFERRAL;
  try {
    return { ...DEFAULT_REFERRAL, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REFERRAL;
  }
}

function writeReferral(r: ReferralState) {
  localStorage.setItem(KEYS.referral, JSON.stringify(r));
  window.dispatchEvent(new Event("referral-changed"));
  syncToFirebaseBackground();
}

async function syncToFirebaseBackground() {
  const uid = getUserId();
  const _db = db();
  if (!uid || !_db) return;
  
  try {
    const ref = doc(_db, "users", uid);
    await setDoc(ref, {
      coins: store.getCoins(),
      referral: readReferral(),
      onboarded: store.isOnboarded()
    }, { merge: true });
  } catch (e) {
    console.error("Failed to sync to Firebase", e);
  }
}

export const store = {
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(KEYS.user);
    return raw ? JSON.parse(raw) : null;
  },
  setUser(u: User) {
    localStorage.setItem(KEYS.user, JSON.stringify(u));
  },
  clear() {
    localStorage.removeItem(KEYS.user);
    localStorage.removeItem(KEYS.coins);
    localStorage.removeItem(KEYS.onboarded);
    localStorage.removeItem(KEYS.referral);
  },
  getCoins(): number {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(KEYS.coins) ?? "200");
  },
  addCoins(n: number) {
    const c = store.getCoins() + n;
    localStorage.setItem(KEYS.coins, String(c));
    window.dispatchEvent(new Event("coins-changed"));
    syncToFirebaseBackground();
    return c;
  },
  setOnboarded() {
    localStorage.setItem(KEYS.onboarded, "1");
    syncToFirebaseBackground();
  },
  isOnboarded() {
    return localStorage.getItem(KEYS.onboarded) === "1";
  },

  async syncWithFirebase(uid: string) {
    const _db = db();
    if (!_db || !uid) return;
    const ref = doc(_db, "users", uid);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.coins !== undefined) {
          localStorage.setItem(KEYS.coins, String(data.coins));
        }
        if (data.referral) {
          localStorage.setItem(KEYS.referral, JSON.stringify(data.referral));
        }
        if (data.onboarded) {
          localStorage.setItem(KEYS.onboarded, "1");
        }
        window.dispatchEvent(new Event("coins-changed"));
        window.dispatchEvent(new Event("referral-changed"));
      } else {
        // Create default user profile in Firebase
        await setDoc(ref, {
          coins: store.getCoins(),
          referral: readReferral(),
          onboarded: store.isOnboarded()
        });
      }
    } catch (e) {
      console.error("Error during initial syncWithFirebase:", e);
    }
  },

  // ---- Referral system ----
  getReferral(): ReferralState {
    return readReferral();
  },
  startReferral() {
    const r = readReferral();
    if (r.total === 0) {
      r.total = 1;
      r.tasks.signup = true;
      writeReferral(r);
    } else if (!r.tasks.signup) {
      r.tasks.signup = true;
      writeReferral(r);
    }
  },
  markReferralTask(key: ReferralTaskKey) {
    const r = readReferral();
    if (r.total === 0) {
      r.total = 1;
      r.tasks.signup = true;
    }
    if (!r.tasks[key]) {
      r.tasks[key] = true;
      maybeCredit(r);
      writeReferral(r);
    }
  },
  incrementSpinForReferral() {
    const r = readReferral();
    if (r.total === 0) {
      r.total = 1;
      r.tasks.signup = true;
    }
    r.spinCount += 1;
    if (r.spinCount >= 5 && !r.tasks.spin5) {
      r.tasks.spin5 = true;
    }
    maybeCredit(r);
    writeReferral(r);
  },
};

function maybeCredit(r: ReferralState) {
  if (r.credited) return;
  const allDone = (Object.keys(r.tasks) as ReferralTaskKey[]).every((k) => r.tasks[k]);
  if (allDone && r.total > 0) {
    r.credited = true;
    r.successful += 1;
    r.coinsEarned += REFERRAL_REWARD;
    const c = store.getCoins() + REFERRAL_REWARD;
    localStorage.setItem(KEYS.coins, String(c));
    window.dispatchEvent(new Event("coins-changed"));
  }
}

export function useCoins() {
  const [c, setC] = useState<number>(0);
  useEffect(() => {
    setC(store.getCoins());
    const h = () => setC(store.getCoins());
    window.addEventListener("coins-changed", h);
    return () => window.removeEventListener("coins-changed", h);
  }, []);
  return c;
}

export function useReferral() {
  const [r, setR] = useState<ReferralState>(DEFAULT_REFERRAL);
  useEffect(() => {
    setR(store.getReferral());
    const h = () => setR(store.getReferral());
    window.addEventListener("referral-changed", h);
    window.addEventListener("coins-changed", h);
    return () => {
      window.removeEventListener("referral-changed", h);
      window.removeEventListener("coins-changed", h);
    };
  }, []);
  const pending = Math.max(0, r.total - r.successful);
  return { ...r, pending };
}
