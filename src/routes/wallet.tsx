import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Coins, Smartphone, IndianRupee, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useCoins, store, getUserId, getProcessedApprovals, markApprovalProcessed } from "@/lib/store";
import {
  MIN_WITHDRAWAL_COINS,
  COINS_PER_RUPEE,
  createWithdrawalRequest,
  subscribeUserRequests,
  hasRequestToday,
  type WithdrawalRequest,
} from "@/lib/withdrawals";
import { ADMOB } from "@/lib/admob";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "My Wallet — EarnSpin Rewards" }] }),
  component: Wallet,
});

function Wallet() {
  const coins = useCoins();
  const [rows, setRows] = useState<WithdrawalRequest[]>([]);
  const [method, setMethod] = useState<"upi" | "paytm">("upi");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { store.markReferralTask("wallet"); }, []);

  useEffect(() => {
    const uid = getUserId();
    const unsub = subscribeUserRequests(uid, (r) => {
      // Deduct coins locally exactly once per newly-approved request
      const processed = new Set(getProcessedApprovals());
      r.forEach((req) => {
        if (req.status === "Approved" && !processed.has(req.id)) {
          const need = req.withdrawalAmount * COINS_PER_RUPEE;
          if (store.getCoins() >= need) store.addCoins(-need);
          markApprovalProcessed(req.id);
        }
      });
      setRows(r);
    });
    return () => unsub();
  }, []);

  const canWithdraw = coins >= MIN_WITHDRAWAL_COINS;
  const alreadyToday = useMemo(() => hasRequestToday(rows), [rows]);
  const maxRupees = Math.floor(coins / COINS_PER_RUPEE);
  const validAccount = account.trim().length >= 4;
  const validAmount = amount >= 30 && amount <= maxRupees;
  const disabled = !canWithdraw || alreadyToday || !validAccount || !validAmount || submitting;

  const submit = async () => {
    if (disabled) return;
    setSubmitting(true); setMsg(null);
    try {
      const u = store.getUser();
      await createWithdrawalRequest({
        userId: getUserId(),
        username: u?.name || "Player",
        userCoins: coins,
        withdrawalAmount: amount,
        upiIdOrPaytmNumber: account.trim(),
      });
      setMsg("Withdrawal request submitted. Coins will be deducted after approval.");
      setAccount("");
    } catch (e: any) {
      setMsg(e?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-5 pt-8 space-y-5">
        <h1 className="text-2xl font-bold">My Wallet</h1>

        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-xs text-muted-foreground">Total Coins</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Coins className="h-6 w-6 text-gold" />
            <span className="text-4xl font-extrabold text-gold">{coins}</span>
          </div>
          <p className="text-lg mt-1">= ₹{(coins / COINS_PER_RUPEE).toFixed(2)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">1000 Coins = ₹10 · Min withdrawal: {MIN_WITHDRAWAL_COINS} coins (₹30)</p>
          {!canWithdraw && (
            <p className="text-[11px] text-destructive mt-2">Minimum 3000 coins (₹30) required for withdrawal.</p>
          )}
        </div>

        {/* Banner ad placeholder (AdMob: {ADMOB.banner}) */}
        <div className="rounded-xl glass border border-dashed border-gold/30 py-2 text-center text-[10px] text-muted-foreground">
          Ad · Banner ({ADMOB.banner})
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold">Request Withdrawal</h2>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMethod("upi")} className={`glass rounded-xl py-2 text-sm flex items-center justify-center gap-2 ${method === "upi" ? "border border-neon-cyan/60 text-neon-cyan" : "text-muted-foreground"}`}>
              <IndianRupee className="h-4 w-4" /> UPI ID
            </button>
            <button onClick={() => setMethod("paytm")} className={`glass rounded-xl py-2 text-sm flex items-center justify-center gap-2 ${method === "paytm" ? "border border-primary/60 text-primary" : "text-muted-foreground"}`}>
              <Smartphone className="h-4 w-4" /> Paytm Number
            </button>
          </div>
          <input
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder={method === "upi" ? "yourname@upi" : "10-digit Paytm number"}
            disabled={!canWithdraw}
            className="w-full rounded-xl bg-background/40 border border-border px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50"
          />
          <div>
            <label className="text-[11px] text-muted-foreground">Amount (₹) — min ₹30, max ₹{maxRupees}</label>
            <input
              type="number" min={30} max={maxRupees}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={!canWithdraw}
              className="mt-1 w-full rounded-xl bg-background/40 border border-border px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50"
            />
          </div>
          {alreadyToday && (
            <p className="text-[11px] text-gold">You already submitted a request today. Try again tomorrow.</p>
          )}
          {msg && <p className="text-[11px] text-neon-green">{msg}</p>}
          <button
            onClick={submit}
            disabled={disabled}
            className="w-full rounded-xl bg-gold text-gold-foreground font-semibold py-3 disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit Withdrawal Request"}
          </button>
          {!canWithdraw && (
            <p className="text-[11px] text-destructive text-center">Minimum 3000 coins (₹30) required for withdrawal.</p>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Withdrawal History</h2>
          <div className="space-y-2">
            {rows.length === 0 && (
              <div className="glass rounded-2xl p-4 text-xs text-muted-foreground text-center">No withdrawal requests yet.</div>
            )}
            {rows.map((r) => (
              <div key={r.id} className="glass rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">₹{r.withdrawalAmount} · {r.upiIdOrPaytmNumber}</p>
                  <p className="text-[11px] text-muted-foreground">{r.requestDate ? r.requestDate.toLocaleString() : "Pending sync"}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatusBadge({ status }: { status: WithdrawalRequest["status"] }) {
  if (status === "Approved")
    return <span className="text-[11px] inline-flex items-center gap-1 text-neon-green"><CheckCircle2 className="h-3.5 w-3.5" />Approved</span>;
  if (status === "Rejected")
    return <span className="text-[11px] inline-flex items-center gap-1 text-destructive"><XCircle className="h-3.5 w-3.5" />Rejected</span>;
  return <span className="text-[11px] inline-flex items-center gap-1 text-gold"><Clock className="h-3.5 w-3.5" />Pending</span>;
}
