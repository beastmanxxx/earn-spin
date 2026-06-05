import { Coins } from "lucide-react";
import { useCoins } from "@/lib/store";

export function CoinBadge() {
  const coins = useCoins();
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/40 px-3 py-1.5">
      <Coins className="h-4 w-4 text-gold" />
      <span className="text-sm font-semibold text-gold">{coins}</span>
      <span className="text-[10px] text-gold/80 uppercase tracking-wider">Coins</span>
    </div>
  );
}
