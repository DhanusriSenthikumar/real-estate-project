"use client";

import type { ButtonHTMLAttributes } from "react";

export default function PasswordToggle({
  visible,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { visible: boolean }) {
  return (
    <button
      type="button"
      aria-label={visible ? "Hide password" : "Show password"}
      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        {visible ? (
          <>
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.5" />
          </>
        ) : (
          <>
            <path d="m3 3 18 18" />
            <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17.2 17.2 0 0 1-3.1 3.7M6.2 6.8C3.8 8.3 2.5 12 2.5 12s3.5 6 9.5 6c1 0 1.9-.2 2.7-.5" />
          </>
        )}
      </svg>
    </button>
  );
}
