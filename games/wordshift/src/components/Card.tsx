import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-line bg-panel/92 p-5 shadow-glow ${className}`}>{children}</section>;
}
