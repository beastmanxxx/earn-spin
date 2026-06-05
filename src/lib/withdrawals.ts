import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export const MIN_WITHDRAWAL_COINS = 3000; // 3000 coins = ₹30 minimum withdrawal
export const COINS_PER_RUPEE = 100; // 1000 coins = ₹10

export type WithdrawalStatus = "Pending" | "Approved" | "Rejected";

export type WithdrawalRequest = {
  id: string;
  userId: string;
  username: string;
  userCoins: number;
  withdrawalAmount: number; // rupees
  upiIdOrPaytmNumber: string;
  requestDate: Date | null;
  status: WithdrawalStatus;
};

const COL = "withdrawal_requests";

function toReq(id: string, d: any): WithdrawalRequest {
  const ts: Timestamp | undefined = d.requestDate;
  return {
    id,
    userId: d.userId ?? "",
    username: d.username ?? "",
    userCoins: Number(d.userCoins ?? 0),
    withdrawalAmount: Number(d.withdrawalAmount ?? 0),
    upiIdOrPaytmNumber: d.upiIdOrPaytmNumber ?? "",
    requestDate: ts?.toDate?.() ?? null,
    status: (d.status ?? "Pending") as WithdrawalStatus,
  };
}

export async function createWithdrawalRequest(input: {
  userId: string;
  username: string;
  userCoins: number;
  withdrawalAmount: number;
  upiIdOrPaytmNumber: string;
}) {
  const _db = db();
  if (!_db) throw new Error("Firebase unavailable");
  await addDoc(collection(_db, COL), {
    ...input,
    status: "Pending",
    requestDate: serverTimestamp(),
  });
}

export function subscribeUserRequests(userId: string, cb: (rows: WithdrawalRequest[]) => void): Unsubscribe {
  const _db = db();
  if (!_db) { cb([]); return () => {}; }
  const q = query(collection(_db, COL), where("userId", "==", userId), orderBy("requestDate", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => toReq(d.id, d.data()))), () => cb([]));
}

export function subscribeAllRequests(cb: (rows: WithdrawalRequest[]) => void): Unsubscribe {
  const _db = db();
  if (!_db) { cb([]); return () => {}; }
  const q = query(collection(_db, COL), orderBy("requestDate", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => toReq(d.id, d.data()))), () => cb([]));
}

export async function updateRequestStatus(id: string, status: WithdrawalStatus) {
  const _db = db();
  if (!_db) throw new Error("Firebase unavailable");
  await updateDoc(doc(_db, COL, id), { status });
}

export function hasRequestToday(rows: WithdrawalRequest[]): boolean {
  const today = new Date();
  return rows.some((r) => {
    if (!r.requestDate) return false;
    return (
      r.requestDate.getFullYear() === today.getFullYear() &&
      r.requestDate.getMonth() === today.getMonth() &&
      r.requestDate.getDate() === today.getDate()
    );
  });
}
