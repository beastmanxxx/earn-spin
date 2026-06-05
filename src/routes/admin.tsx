import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Search, CheckCircle2, XCircle, Clock, Shield } from "lucide-react";
import {
  subscribeAllRequests,
  updateRequestStatus,
  type WithdrawalRequest,
  type WithdrawalStatus,
} from "@/lib/withdrawals";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Rajeev Admin Withdrawal" }] }),
  component: Admin,
});

// Admin passcode — only the admin operator should know this. Change before release.
const ADMIN_PASSCODE = "@rajeev_15";
const ADMIN_KEY = "earnspin_admin_authed";

function Admin() {
  const [authed, setAuthed] = useState<boolean>(() =>
    typeof window !== "undefined" && sessionStorage.getItem(ADMIN_KEY) === "1"
  );
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [rows, setRows] = useState<WithdrawalRequest[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | WithdrawalStatus>("All");

  useEffect(() => {
    if (!authed) return;
    return subscribeAllRequests(setRows);
  }, [authed]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== "All" && r.status !== filter) return false;
      if (!q.trim()) return true;
      const s = q.trim().toLowerCase();
      return (
        r.username.toLowerCase().includes(s) ||
        r.userId.toLowerCase().includes(s) ||
        r.upiIdOrPaytmNumber.toLowerCase().includes(s)
      );
    });
  }, [rows, q, filter]);

  const counts = useMemo(() => ({
    pending: rows.filter((r) => r.status === "Pending").length,
    approved: rows.filter((r) => r.status === "Approved").length,
    rejected: rows.filter((r) => r.status === "Rejected").length,
  }), [rows]);

  if (!authed) {
    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      if (pass === ADMIN_PASSCODE) {
        sessionStorage.setItem(ADMIN_KEY, "1");
        setAuthed(true);
        setErr("");
      } else {
        setErr("Incorrect admin passcode.");
      }
    };
    return (
      <PhoneFrame>
        <main className="flex-1 flex flex-col justify-center px-6 space-y-4">
          <div className="glass rounded-2xl p-5 text-center border border-gold/40">
            <Shield className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-lg font-bold text-gold">Only Rajeev can access this section.</p>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Shield className="h-5 w-5 text-neon-cyan" />
            <h1 className="text-xl font-bold">Rajeev Admin Withdrawal</h1>
          </div>
          <form onSubmit={submit} className="glass rounded-2xl p-4 space-y-3">
            <label className="text-xs text-muted-foreground">Admin passcode</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Enter admin passcode"
              className="w-full rounded-xl bg-input/70 border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            {err && <p className="text-xs text-destructive">{err}</p>}
            <button type="submit" className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-2.5">
              Continue
            </button>
            <p className="text-[10px] text-muted-foreground text-center">
              Only the admin operator should have this passcode.
            </p>
          </form>
        </main>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <main className="flex-1 overflow-y-auto px-5 pt-6 pb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-neon-cyan" />
            <h1 className="text-xl font-bold">Rajeev Admin Withdrawal</h1>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem(ADMIN_KEY); setAuthed(false); setPass(""); }}
            className="text-[11px] text-muted-foreground underline"
          >Sign out</button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Pending" value={counts.pending} tone="text-gold" />
          <Stat label="Approved" value={counts.approved} tone="text-neon-green" />
          <Stat label="Rejected" value={counts.rejected} tone="text-destructive" />
        </div>

        <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by user, ID or UPI/Paytm"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex gap-2">
          {(["All", "Pending", "Approved", "Rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 text-xs rounded-lg py-1.5 glass ${filter === f ? "border border-primary/60 text-primary" : "text-muted-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center text-xs text-muted-foreground">No requests.</div>
          )}
          {filtered.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{r.username} <span className="text-muted-foreground">· ₹{r.withdrawalAmount}</span></p>
                  <p className="text-[11px] text-muted-foreground">{r.upiIdOrPaytmNumber}</p>
                  <p className="text-[10px] text-muted-foreground">UID: {r.userId} · Coins: {r.userCoins}</p>
                  <p className="text-[10px] text-muted-foreground">{r.requestDate ? r.requestDate.toLocaleString() : "—"}</p>
                </div>
                <Badge status={r.status} />
              </div>
              {r.status === "Pending" && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => updateRequestStatus(r.id, "Approved")}
                    className="flex-1 rounded-lg bg-neon-green/20 border border-neon-green/50 text-neon-green text-xs py-2"
                  >Approve</button>
                  <button
                    onClick={() => updateRequestStatus(r.id, "Rejected")}
                    className="flex-1 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-xs py-2"
                  >Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </PhoneFrame>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <p className={`font-bold text-lg ${tone}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Badge({ status }: { status: WithdrawalStatus }) {
  if (status === "Approved") return <span className="text-[11px] inline-flex items-center gap-1 text-neon-green"><CheckCircle2 className="h-3.5 w-3.5" />Approved</span>;
  if (status === "Rejected") return <span className="text-[11px] inline-flex items-center gap-1 text-destructive"><XCircle className="h-3.5 w-3.5" />Rejected</span>;
  return <span className="text-[11px] inline-flex items-center gap-1 text-gold"><Clock className="h-3.5 w-3.5" />Pending</span>;
}
