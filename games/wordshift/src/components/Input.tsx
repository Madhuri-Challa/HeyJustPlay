import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-200">
      <span>{label}</span>
      <input
        className={`min-h-12 rounded-lg border border-line bg-ink/70 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-mint ${className}`}
        enterKeyHint="done"
        inputMode="text"
        type="text"
        {...props}
      />
    </label>
  );
}
