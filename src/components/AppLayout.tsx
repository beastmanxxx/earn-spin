import type { ReactNode } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame>
      <main className="flex-1 overflow-y-auto pb-2">{children}</main>
      <BottomNav />
    </PhoneFrame>
  );
}
