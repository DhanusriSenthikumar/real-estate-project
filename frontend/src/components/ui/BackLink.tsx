import Link from "next/link";

export default function BackLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
    >
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  );
}
