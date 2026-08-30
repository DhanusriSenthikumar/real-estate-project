import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100",
  accent:
    "bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:bg-emerald-600",
  destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

type Variant = keyof typeof variants;
type CommonProps = {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;
export function Button({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {loading ? "Please wait..." : children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
