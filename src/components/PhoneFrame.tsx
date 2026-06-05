import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#06030f]">
      <div className="relative w-full max-w-[430px] min-h-screen md:min-h-[900px] md:my-6 md:rounded-[2.5rem] overflow-hidden galaxy-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 pointer-events-none" />
        <div className="relative z-10 flex flex-col min-h-screen md:min-h-[900px]">
          {children}
        </div>
      </div>
    </div>
  );
}
