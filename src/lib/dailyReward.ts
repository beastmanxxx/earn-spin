import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export const DAILY_REWARD_COINS = 50;
export const DAILY_REWARD_INTERVAL_MS = 24 * 60 * 60 * 1000;

const COL = "daily_rewards";

export type DailyRewardState = {
  lastClaimAt: Date | null;
  nextClaimAt: Date | null;
  canClaim: boolean;
  msRemaining: number;
};

export async function getDailyRewardState(userId: string): Promise<DailyRewardState> {
  const _db = db();
  if (!_db || !userId) return { lastClaimAt: null, nextClaimAt: null, canClaim: true, msRemaining: 0 };
  try {
    const snap = await getDoc(doc(_db, COL, userId));
    if (!snap.exists()) return { lastClaimAt: null, nextClaimAt: null, canClaim: true, msRemaining: 0 };
    const ts: Timestamp | undefined = snap.data()?.lastClaimAt;
    const last = ts?.toDate?.() ?? null;
    if (!last) return { lastClaimAt: null, nextClaimAt: null, canClaim: true, msRemaining: 0 };
    const next = new Date(last.getTime() + DAILY_REWARD_INTERVAL_MS);
    const ms = next.getTime() - Date.now();
    return { lastClaimAt: last, nextClaimAt: next, canClaim: ms <= 0, msRemaining: Math.max(0, ms) };
  } catch {
    return { lastClaimAt: null, nextClaimAt: null, canClaim: true, msRemaining: 0 };
  }
}

export async function claimDailyReward(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const _db = db();
  if (!_db || !userId) return { ok: false, reason: "Firebase unavailable" };
  const state = await getDailyRewardState(userId);
  if (!state.canClaim) return { ok: false, reason: "Already claimed" };
  await setDoc(doc(_db, COL, userId), { userId, lastClaimAt: serverTimestamp() }, { merge: true });
  return { ok: true };
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
