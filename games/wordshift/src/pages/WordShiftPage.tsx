import { Link } from "react-router-dom";
import { Card } from "../components/Card";

const steps = ["Join with a code", "Start from the same word", "Change one letter at a time", "Hidden scores reveal at the end"];

export function WordShiftPage() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <section className="grid gap-6 py-8 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-mint">Multiplayer word race</p>
        <div className="grid max-w-3xl gap-4">
          <h1 className="text-5xl font-black leading-tight text-white sm:text-7xl">WordShift</h1>
          <p className="text-xl font-semibold text-slate-300 sm:text-2xl">Shift one letter. Build the word tree together.</p>
        </div>
        <div className="grid gap-3 sm:flex">
          <Link to="/create" className="min-h-12 rounded-lg bg-mint px-5 py-3 text-center text-sm font-bold text-ink transition hover:bg-emerald-300">
            Create Game
          </Link>
          <Link to="/join" className="min-h-12 rounded-lg bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/15">
            Join Game
          </Link>
        </div>
      </section>

      <Card>
        <h2 className="text-xl font-black text-white">How It Works</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-lg border border-line bg-ink/50 p-4">
              <p className="font-mono text-2xl font-black text-mint">{index + 1}</p>
              <p className="mt-2 font-semibold text-slate-200">{step}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
