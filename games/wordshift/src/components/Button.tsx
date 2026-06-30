import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variants = {
  primary: "bg-mint text-ink hover:bg-emerald-300",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  ghost: "bg-transparent text-slate-200 hover:bg-white/10",
  danger: "bg-coral text-white hover:bg-rose-400",
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`min-h-12 rounded-lg px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
