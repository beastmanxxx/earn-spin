import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export const DAILY_SPINS = 5;
export const DAILY_SPIN_INTERVAL_MS = 24 * 60 * 60 * 1000;

const COL = "daily_spins";

export type DailySpinState = {
  spinsLeft: number;
  bonusSpins: number;
  resetAt: Date | null;
  msUntilReset: number;
};

type DocShape = {
  used?: number;
  bonus?: number;
  startedAt?: Timestamp;
};

function computeState(data: DocShape | null): DailySpinState {
  const now = Date.now();
  const started = data?.startedAt?.toDate?.() ?? null;
  const resetAt = started ? new Date(started.getTime() + DAILY_SPIN_INTERVAL_MS) : null;
  const expired = !resetAt || resetAt.getTime() <= now;
  if (expired) {
    return { spinsLeft: DAILY_SPINS, bonusSpins: 0, resetAt: null, msUntilReset: 0 };
  }
  const used = Math.min(DAILY_SPINS, Math.max(0, data?.used ?? 0));
  const bonus = Math.max(0, data?.bonus ?? 0);
  return {
    spinsLeft: Math.max(0, DAILY_SPINS - used) + bonus,
    bonusSpins: bonus,
    resetAt,
    msUntilReset: Math.max(0, resetAt.getTime() - now),
  };
}

export async function getDailySpinState(userId: string): Promise<DailySpinState> {
  const _db = db();
  if (!_db || !userId) return { spinsLeft: DAILY_SPINS, bonusSpins: 0, resetAt: null, msUntilReset: 0 };
  try {
    const snap = await getDoc(doc(_db, COL, userId));
    return computeState(snap.exists() ? (snap.data() as DocShape) : null);
  } catch {
    return { spinsLeft: DAILY_SPINS, bonusSpins: 0, resetAt: null, msUntilReset: 0 };
  }
}

/** Consume a single spin. Returns the new state. */
export async function consumeSpin(userId: string): Promise<DailySpinState> {
  const _db = db();
  if (!_db || !userId) return { spinsLeft: DAILY_SPINS - 1, bonusSpins: 0, resetAt: null, msUntilReset: 0 };
  const ref = doc(_db, COL, userId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? (snap.data() as DocShape) : null;
  const started = data?.startedAt?.toDate?.() ?? null;
  const expired = !started || started.getTime() + DAILY_SPIN_INTERVAL_MS <= Date.now();
  if (!snap.exists() || expired) {
    // Start a new 24h window and count this spin.
    await setDoc(ref, { userId, used: 1, bonus: 0, startedAt: serverTimestamp() });
  } else {
    const bonus = Math.max(0, data?.bonus ?? 0);
    if (bonus > 0) {
      await updateDoc(ref, { bonus: increment(-1) });
    } else {
      await updateDoc(ref, { used: increment(1) });
    }
  }
  return getDailySpinState(userId);
}

/** Add a bonus spin (from rewarded ad). */
export async function addBonusSpin(userId: string): Promise<DailySpinState> {
  const _db = db();
  if (!_db || !userId) return getDailySpinState(userId);
  const ref = doc(_db, COL, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { userId, used: 0, bonus: 1, startedAt: serverTimestamp() });
  } else {
    await updateDoc(ref, { bonus: increment(1) });
  }
  return getDailySpinState(userId);
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
