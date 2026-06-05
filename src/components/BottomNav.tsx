import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Disc3, Gamepad2, Wallet, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/spin", label: "Spin", icon: Disc3 },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-20 glass border-t border-border px-2 pt-2 pb-3">
      <ul className="flex items-center justify-between">
        {items.map((it) => {
          const active = pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={`flex flex-col items-center gap-1 py-1 text-xs ${
                  active ? "text-gold" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-gold" : ""}`} />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
