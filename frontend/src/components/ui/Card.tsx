import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "neutral" | "danger";
}) {
  const styles = {
    accent: "bg-emerald-100 text-emerald-800",
    neutral: "bg-slate-100 text-slate-700",
    danger: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
