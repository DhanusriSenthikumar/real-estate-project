"use client";

import Link from "next/link";
import { useState } from "react";
import { registerUser } from "@/src/lib/api";
import { Button } from "@/src/components/ui/Button";
import { TextInput } from "@/src/components/ui/FormField";
import BackLink from "@/src/components/ui/BackLink";
import PasswordToggle from "@/src/components/ui/PasswordToggle";
import Feedback from "@/src/components/ui/Feedback";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await registerUser(form);
      setMessage(result.message || "Account created successfully");
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-2">
        <div className="hidden bg-[linear-gradient(135deg,#0f172a,#1e293b)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
              Welcome home
            </p>
            <h1 className="mt-6 text-4xl font-bold">
              Create your property account
            </h1>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">
              Find the place you deserve with expert support, trusted agents,
              and curated homes.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <BackLink href="/">Back to home</BackLink>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Register
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Join Riviera
              </h2>
            </div>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Sign in
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <TextInput
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="off"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  required
                  className="h-[54px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />

                <PasswordToggle
                  onClick={() => setShowPassword((visible) => !visible)}
                  visible={showPassword}
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>

            {message && <Feedback tone="success">{message}</Feedback>}
          </form>
        </div>
      </div>
    </main>
  );
}
