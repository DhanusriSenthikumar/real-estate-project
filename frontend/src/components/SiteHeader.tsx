"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  isAuthenticated,
  logoutUser,
  subscribeToAuthChanges,
} from "@/src/lib/api";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
];

const privateLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/properties", label: "My Properties" },
  { href: "/profile", label: "Profile" },
  { href: "/dashboard/properties/new", label: "Add Property" },
];

export default function SiteHeader({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const textClass = dark ? "text-slate-200" : "text-slate-600";

  // Subscribe to authentication changes
  useEffect(() => {
    const sync = () => setAuthenticated(isAuthenticated());
    sync();
    const unsubscribe = subscribeToAuthChanges(sync);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  // Determine which links to show based on authentication
  const links = authenticated
    ? [...publicLinks, ...privateLinks]
    : [
        ...publicLinks,
        { href: "/login", label: "Sign in" },
        { href: "/register", label: "Register" },
      ];

  // Check if a link is active
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/properties") {
      return (
        pathname === "/dashboard/properties" ||
        (pathname.startsWith("/dashboard/properties/") &&
          pathname !== "/dashboard/properties/new")
      );
    }
    if (href === "/dashboard/properties/new") {
      return pathname === "/dashboard/properties/new";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Handle logout
  async function handleLogout() {
    await logoutUser();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-200 ${
        dark
          ? "border-white/10 bg-slate-950/70 shadow-[0_10px_30px_rgba(15,23,42,0.35)]"
          : "border-slate-200 bg-white/80 shadow-sm"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950">
            R
          </span>
          <span
            className={
              dark
                ? "text-lg font-semibold text-white"
                : "text-lg font-semibold text-slate-900"
            }
          >
            Riviera Realty
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${
                isActive(link.href)
                  ? "font-semibold text-emerald-500"
                  : textClass
              } transition hover:text-emerald-500`}
            >
              {link.label}
            </Link>
          ))}

          {authenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className={`${textClass} transition hover:text-emerald-500`}
            >
              Log out
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            className={
              dark
                ? "rounded-xl border border-white/20 p-2 text-white md:hidden"
                : "rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
            }
          >
            <span className="block text-xl leading-none" aria-hidden="true">
              ☰
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <>
            {/* Overlay */}
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-950/30 md:hidden"
            />

            {/* Sidebar Menu */}
            <aside className="fixed inset-y-0 right-0 z-[70] h-screen w-[300px] max-w-[85vw] overflow-hidden border-l border-slate-200 bg-white shadow-2xl md:hidden">
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Menu
                </p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-lg p-2 text-xl leading-none text-slate-500 hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2 p-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block w-full rounded-xl px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-slate-50 hover:text-emerald-600 ${
                      isActive(link.href)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {authenticated && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-600"
                  >
                    Log out
                  </button>
                )}
              </nav>
            </aside>
          </>
        )}
      </div>
    </header>
  );
}
