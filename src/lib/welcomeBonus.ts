import { doc, runTransaction, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

export const WELCOME_BONUS_COINS = 100;
const COL = "welcome_bonus";
const TX_COL = "transactions";

/**
 * Atomically claim the one-time welcome bonus tied to the user's phone number.
 * Returns true ONLY the first time it succeeds for that account. All subsequent
 * calls (reinstall, logout, new device) return false because the Firestore
 * flag persists permanently against the account (phone).
 */
export async function claimWelcomeBonus(phone: string, userId: string): Promise<boolean> {
  const _db = db();
  if (!_db || !phone) return false;
  const ref = doc(_db, COL, phone);
  try {
    const granted = await runTransaction(_db, async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists()) return false;
      tx.set(ref, {
        phone,
        userId,
        welcomeBonusClaimed: true,
        coins: WELCOME_BONUS_COINS,
        claimedAt: serverTimestamp(),
      });
      return true;
    });
    if (granted) {
      try {
        await addDoc(collection(_db, TX_COL), {
          phone,
          userId,
          type: "welcome_bonus",
          description: "Welcome Bonus +100 Coins",
          amount: WELCOME_BONUS_COINS,
          createdAt: serverTimestamp(),
        });
      } catch { /* non-fatal */ }
    }
    return granted;
  } catch (e) {
    console.warn("[welcomeBonus] claim failed", e);
    return false;
  }
}
