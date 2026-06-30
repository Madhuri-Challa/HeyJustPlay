import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(54,211,153,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,113,133,0.13),transparent_28%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6">
        <header className="flex items-center justify-between py-2">
          <Link to="/" className="text-xl font-black tracking-wide text-white">
            Hey Just Play
          </Link>
          <nav className="flex gap-2">
            <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10" to="/">
              Games
            </Link>
            <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10" to="/join">
              Join
            </Link>
            <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10" to="/create">
              Create
            </Link>
          </nav>
        </header>
        <div className="flex flex-1 flex-col py-5">{children}</div>
      </div>
    </main>
  );
}
