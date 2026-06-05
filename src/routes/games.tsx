import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Circle, Apple, Car, Calculator } from "lucide-react";
import { store } from "@/lib/store";

export const Route = createFileRoute("/games")({
  head: () => ({ meta: [{ title: "Games — EarnSpin Rewards" }] }),
  component: Games,
});

type GameId = "bubble" | "fruit" | "car" | "math";

const list: { id: GameId; title: string; sub: string; max: number; icon: typeof Circle; tint: string; color: string }[] = [
  { id: "bubble", title: "Bubble Pop", sub: "1 coin per 10 bubbles popped", max: 10, icon: Circle, tint: "from-primary/30 to-primary/5", color: "text-primary" },
  { id: "fruit", title: "Fruit Slash", sub: "1 coin per 10 fruits sliced", max: 10, icon: Apple, tint: "from-neon-green/25 to-neon-green/5", color: "text-neon-green" },
  { id: "car", title: "Car Race", sub: "1 coin per 50 cars avoided", max: 20, icon: Car, tint: "from-gold/30 to-gold/5", color: "text-gold" },
  { id: "math", title: "Math Quiz", sub: "1 coin per correct answer", max: 10, icon: Calculator, tint: "from-neon-pink/25 to-neon-pink/5", color: "text-neon-pink" },
];

function Games() {
  const [active, setActive] = useState<GameId | null>(null);
  const open = (id: GameId) => { store.markReferralTask("game"); setActive(id); };
  if (active) return <GameView id={active} onExit={() => setActive(null)} />;
  return (
    <AppLayout>
      <div className="px-5 pt-8 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Games</h1>
          <p className="text-sm text-muted-foreground">Play & Earn Coins</p>
        </div>
        <div className="rounded-xl glass border border-dashed border-gold/30 py-2 text-center text-[10px] text-muted-foreground">Ad · Banner</div>
        <div className="space-y-3">
          {list.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                onClick={() => open(g.id)}
                className={`w-full text-left glass rounded-2xl p-4 flex items-center gap-3 bg-gradient-to-r ${g.tint}`}
              >
                <div className="h-12 w-12 rounded-xl bg-background/40 flex items-center justify-center">
                  <Icon className={`h-6 w-6 ${g.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{g.title}</p>
                  <p className="text-xs text-muted-foreground">{g.sub}</p>
                  <p className="text-[11px] text-gold mt-1">Up to {g.max} coins</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

function GameView({ id, onExit }: { id: GameId; onExit: () => void }) {
  const game = list.find((g) => g.id === id)!;
  if (id === "math") return <MathQuizGame game={game} onExit={onExit} />;
  if (id === "car") return <CarRaceGame game={game} onExit={onExit} />;
  return <TimedTapGame game={game} onExit={onExit} />;
}

function GameShell({
  game,
  onExit,
  hud,
  children,
}: {
  game: (typeof list)[number];
  onExit: () => void;
  hud?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onExit} className="h-9 w-9 rounded-lg glass flex items-center justify-center text-sm">←</button>
          <h2 className="font-semibold">{game.title}</h2>
          <div className="min-w-[3rem] text-right">{hud}</div>
        </div>
        {children}
      </div>
    </AppLayout>
  );
}

/* ---------------- Math Quiz: 10 questions in 25s, 5 coins per correct ---------------- */

type MQ = { a: number; b: number; op: "+" | "-" | "×"; ans: number; opts: number[] };
function makeMathQ(): MQ {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const op = ["+", "-", "×"][Math.floor(Math.random() * 3)] as "+" | "-" | "×";
  const ans = op === "+" ? a + b : op === "-" ? a - b : a * b;
  const opts = [ans, ans + Math.floor(Math.random() * 5) + 1, ans - Math.floor(Math.random() * 5) - 1, ans + 7]
    .sort(() => Math.random() - 0.5);
  return { a, b, op, ans, opts };
}

function MathQuizGame({ game, onExit }: { game: (typeof list)[number]; onExit: () => void }) {
  const TOTAL = 10;
  const LIMIT = 25;
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [time, setTime] = useState(LIMIT);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [q, setQ] = useState<MQ>(makeMathQ);
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  const awarded = useRef(false);

  const finish = (c: number, w: number) => {
    if (awarded.current) return;
    awarded.current = true;
    const coins = c; // 1 coin per correct answer
    store.addCoins(coins);
    setOver(true);
  };

  useEffect(() => {
    if (!started || over) return;
    if (time <= 0) { finish(correct, wrong + (TOTAL - correct - wrong)); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, time, over]); // eslint-disable-line

  const answer = (n: number) => {
    if (over) return;
    const isOk = n === q.ans;
    setFlash(isOk ? "ok" : "no");
    const nc = correct + (isOk ? 1 : 0);
    const nw = wrong + (isOk ? 0 : 1);
    if (isOk) setCorrect(nc); else setWrong(nw);
    const next = idx + 1;
    setTimeout(() => {
      setFlash(null);
      if (next >= TOTAL) finish(nc, nw);
      else { setIdx(next); setQ(makeMathQ()); }
    }, 300);
  };

  const reset = () => {
    awarded.current = false;
    setStarted(false); setOver(false); setTime(LIMIT);
    setIdx(0); setCorrect(0); setWrong(0); setQ(makeMathQ());
  };

  const Icon = game.icon;
  const coins = correct;

  return (
    <GameShell game={game} onExit={onExit} hud={started && !over ? <span className="px-3 py-1 rounded-lg glass text-xs">{time}s · {idx + 1}/{TOTAL}</span> : null}>
      {!started && (
        <div className="text-center py-10">
          <div className={`mx-auto h-28 w-28 rounded-full border-2 border-current ${game.color} flex items-center justify-center mb-4 bg-background/30`}>
            <Icon className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold">{game.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Answer 10 questions in 25 seconds. Earn 1 coin per correct answer.</p>
          <button onClick={() => setStarted(true)} className="mt-6 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">Play Now</button>
        </div>
      )}

      {started && !over && (
        <div className={`relative h-[500px] rounded-2xl glass overflow-hidden flex flex-col items-center justify-center gap-6 transition-colors ${flash === "ok" ? "bg-neon-green/20" : flash === "no" ? "bg-destructive/20" : ""}`}>
          <p className="text-xs text-muted-foreground">Question {idx + 1} of {TOTAL}</p>
          <p className="text-5xl font-extrabold">{q.a} {q.op} {q.b} = ?</p>
          <div className="grid grid-cols-2 gap-3 w-64">
            {q.opts.map((o, i) => (
              <button key={i} onClick={() => answer(o)} className="glass rounded-xl py-4 text-2xl font-bold">{o}</button>
            ))}
          </div>
        </div>
      )}

      {over && (
        <div className="text-center py-10">
          <h3 className="text-3xl font-bold text-gold">Game Over!</h3>
          <div className="mt-4 space-y-1 text-sm">
            <p>Score: <span className="font-semibold">{correct}/{TOTAL}</span></p>
            <p className="text-neon-green">Correct: {correct}</p>
            <p className="text-destructive">Wrong: {wrong + Math.max(0, TOTAL - correct - wrong)}</p>
          </div>
          <p className="mt-3 text-gold text-lg font-semibold">+{coins} coins earned</p>
          <button onClick={reset} className="mt-6 px-8 py-3 rounded-xl bg-gold text-gold-foreground font-semibold">Play Again</button>
        </div>
      )}
    </GameShell>
  );
}

/* ---------------- Car Race: collision → game over, +2 per dodge ---------------- */

type Obs = { id: number; lane: number; y: number; counted: boolean };

function CarRaceGame({ game, onExit }: { game: (typeof list)[number]; onExit: () => void }) {
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [lane, setLane] = useState(1);
  const [items, setItems] = useState<Obs[]>([]);
  const [dodged, setDodged] = useState(0);
  const laneRef = useRef(1);
  const overRef = useRef(false);
  const awarded = useRef(false);
  const CAR_Y = 85;

  useEffect(() => { laneRef.current = lane; }, [lane]);
  useEffect(() => { overRef.current = over; }, [over]);

  useEffect(() => {
    if (!started || over) return;
    const spawner = setInterval(() => {
      if (overRef.current) return;
      setItems((arr) => [...arr, { id: Math.random(), lane: Math.floor(Math.random() * 3), y: -10, counted: false }]);
    }, 900);
    const ticker = setInterval(() => {
      if (overRef.current) return;
      setItems((arr) => {
        const next: Obs[] = [];
        for (const a of arr) {
          const ny = a.y + 5;
          // collision check when overlapping the car band
          if (a.lane === laneRef.current && ny >= CAR_Y - 8 && ny <= CAR_Y + 8 && !a.counted) {
            if (!awarded.current) {
              awarded.current = true;
              store.addCoins(Math.floor(dodgedRef.current / 50));
            }
            overRef.current = true;
            setOver(true);
            return arr;
          }
          if (ny > CAR_Y + 8 && !a.counted) {
            a.counted = true;
            setDodged((d) => { dodgedRef.current = d + 1; return d + 1; });
          }
          if (ny < 110) next.push({ ...a, y: ny });
        }
        return next;
      });
    }, 120);
    return () => { clearInterval(spawner); clearInterval(ticker); };
  }, [started, over]);

  const dodgedRef = useRef(0);
  useEffect(() => { dodgedRef.current = dodged; }, [dodged]);

  const move = (dir: -1 | 1) => { if (!over) setLane((l) => Math.max(0, Math.min(2, l + dir))); };

  const reset = () => {
    awarded.current = false;
    overRef.current = false;
    dodgedRef.current = 0;
    setItems([]); setDodged(0); setLane(1); setOver(false); setStarted(false);
  };

  const Icon = game.icon;
  const coins = Math.floor(dodged / 50);

  return (
    <GameShell game={game} onExit={onExit} hud={started && !over ? <span className="px-3 py-1 rounded-lg glass text-xs">{dodged} · {coins}c</span> : null}>
      {!started && (
        <div className="text-center py-10">
          <div className={`mx-auto h-28 w-28 rounded-full border-2 border-current ${game.color} flex items-center justify-center mb-4 bg-background/30`}>
            <Icon className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold">{game.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Dodge obstacles. Earn 1 coin for every 50 vehicles avoided. One crash ends the game.</p>
          <button onClick={() => setStarted(true)} className="mt-6 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">Play Now</button>
        </div>
      )}

      {started && !over && (
        <div className="relative h-[500px] rounded-2xl glass overflow-hidden bg-gradient-to-b from-background to-gold/10">
          {[0, 1, 2].map((l) => (
            <div key={l} className="absolute top-0 bottom-0 border-l border-dashed border-white/20" style={{ left: `${(l + 1) * 25}%` }} />
          ))}
          {items.map((t) => (
            <div key={t.id} className="absolute text-3xl" style={{ left: `calc(${(t.lane * 33) + 12}% )`, top: `${t.y}%` }}>🛢️</div>
          ))}
          <div className="absolute text-4xl transition-all" style={{ left: `calc(${(lane * 33) + 12}%)`, top: `${CAR_Y}%` }}>🏎️</div>
          <div className="absolute bottom-3 inset-x-0 flex justify-between px-4">
            <button onClick={() => move(-1)} className="h-12 w-20 rounded-xl bg-background/60 glass text-xl">◀</button>
            <button onClick={() => move(1)} className="h-12 w-20 rounded-xl bg-background/60 glass text-xl">▶</button>
          </div>
        </div>
      )}

      {over && (
        <div className="text-center py-10">
          <h3 className="text-3xl font-bold text-destructive">Crash! Game Over</h3>
          <p className="mt-2 text-muted-foreground">Vehicles avoided: {dodged}</p>
          <p className="mt-1 text-gold text-lg font-semibold">+{coins} coins earned</p>
          <button onClick={reset} className="mt-6 px-8 py-3 rounded-xl bg-gold text-gold-foreground font-semibold">Play Again</button>
        </div>
      )}
    </GameShell>
  );
}

/* ---------------- Bubble Pop & Fruit Slash: original timed-tap (30s) ---------------- */

function TimedTapGame({ game, onExit }: { game: (typeof list)[number]; onExit: () => void }) {
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [time, setTime] = useState(30);
  const [score, setScore] = useState(0);
  const awarded = useRef(false);

  useEffect(() => {
    if (!started || over) return;
    if (time <= 0) {
      if (!awarded.current) {
        awarded.current = true;
        store.addCoins(Math.floor(score / 10));
      }
      setOver(true);
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, time, over]); // eslint-disable-line

  const Icon = game.icon;
  const coins = Math.floor(score / 10);

  return (
    <GameShell game={game} onExit={onExit} hud={started && !over ? <span className="px-3 py-1 rounded-lg glass text-xs">{time}s · {score}</span> : null}>
      {!started && (
        <div className="text-center py-10">
          <div className={`mx-auto h-28 w-28 rounded-full border-2 border-current ${game.color} flex items-center justify-center mb-4 bg-background/30`}>
            <Icon className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold">{game.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{game.sub}. 30 seconds to score as many as you can.</p>
          <button onClick={() => { awarded.current = false; setStarted(true); setTime(30); setScore(0); setOver(false); }} className="mt-6 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">Play Now</button>
        </div>
      )}

      {started && !over && (game.id === "bubble" ? <BubblePop onTap={() => setScore((s) => s + 1)} /> : <FruitSlash onTap={() => setScore((s) => s + 1)} />)}

      {over && (
        <div className="text-center py-10">
          <h3 className="text-3xl font-bold text-gold">Game Over!</h3>
          <p className="mt-2 text-muted-foreground">Score: {score}</p>
          <p className="mt-1 text-gold">+{coins} coins earned</p>
          <button onClick={() => setStarted(false)} className="mt-6 px-8 py-3 rounded-xl bg-gold text-gold-foreground font-semibold">Play Again</button>
        </div>
      )}
    </GameShell>
  );
}

function useSpawner<T>(make: () => T, intervalMs: number, max = 12) {
  const [items, setItems] = useState<(T & { id: number })[]>([]);
  useEffect(() => {
    const i = setInterval(() => {
      setItems((arr) => [...arr.slice(-max), { ...(make() as T), id: Math.random() }]);
    }, intervalMs);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [items, setItems] as const;
}

function BubblePop({ onTap }: { onTap: () => void }) {
  const colors = ["#22c55e", "#a855f7", "#f59e0b", "#ec4899", "#3b82f6"];
  const [items, setItems] = useSpawner(
    () => ({ x: Math.random() * 80 + 5, y: Math.random() * 70 + 10, c: colors[Math.floor(Math.random() * colors.length)] }),
    700,
  );
  return (
    <div className="relative h-[500px] rounded-2xl glass overflow-hidden">
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => { onTap(); setItems((arr) => arr.filter((x) => x.id !== t.id)); }}
          className="absolute h-12 w-12 rounded-full animate-pulse"
          style={{ left: `${t.x}%`, top: `${t.y}%`, background: t.c, boxShadow: `0 0 20px ${t.c}` }}
        />
      ))}
    </div>
  );
}

function FruitSlash({ onTap }: { onTap: () => void }) {
  const fruits = ["🍎", "🍊", "🍌", "🍉", "🍓", "🥝", "🍇"];
  const [items, setItems] = useSpawner(
    () => ({ x: Math.random() * 80 + 5, y: Math.random() * 70 + 10, f: fruits[Math.floor(Math.random() * fruits.length)] }),
    650,
  );
  return (
    <div className="relative h-[500px] rounded-2xl glass overflow-hidden bg-gradient-to-br from-neon-green/10 to-gold/10">
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => { onTap(); setItems((arr) => arr.filter((x) => x.id !== t.id)); }}
          className="absolute text-4xl animate-pulse"
          style={{ left: `${t.x}%`, top: `${t.y}%` }}
        >
          {t.f}
        </button>
      ))}
    </div>
  );
}
