"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
import PublicOnly from "@/src/components/PublicOnly";
import { loginUser, setAuthSession } from "@/src/lib/api";
import { Button } from "@/src/components/ui/Button";
import { TextInput } from "@/src/components/ui/FormField";
import BackLink from "@/src/components/ui/BackLink";
import PasswordToggle from "@/src/components/ui/PasswordToggle";
import Feedback from "@/src/components/ui/Feedback";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await loginUser({ email, password });
      setAuthSession(result.token, result.user);

      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.replace(redirectTo);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicOnly>
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-2">
          <div className="hidden bg-[linear-gradient(135deg,#0f172a,#1e293b)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                Your next move
              </p>
              <h1 className="mt-6 text-4xl font-bold">
                Welcome back to Riviera
              </h1>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">
                Access your saved properties, dashboard, and listing tools in
                one streamlined experience.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <BackLink href="/">Back to home</BackLink>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Login
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Sign in
                </h2>
              </div>
              <Link
                href="/register"
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Create account
              </Link>
            </div>

            <form
              onSubmit={handleLogin}
              autoComplete="off"
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <TextInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  autoComplete="off"
                  spellCheck={true}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="relative w-full">
                <TextInput
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  autoComplete="new-password"
                  spellCheck={false}
                  placeholder="Enter your password"
                  required
                  className="h-[54px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />

                <PasswordToggle
                  onClick={() => setShowPassword((visible) => !visible)}
                  visible={showPassword}
                />
              </div>

              <Button type="submit" loading={loading} className="w-full">
                Sign in
              </Button>

              {message && <Feedback>{message}</Feedback>}
            </form>
          </div>
        </div>
      </main>
    </PublicOnly>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 text-slate-600">
          Loading sign in...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
