"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import SiteHeader from "@/src/components/SiteHeader";
import { getCurrentUser, updateProfile } from "@/src/lib/api";
import { Button } from "@/src/components/ui/Button";
import { TextInput } from "@/src/components/ui/FormField";
import Feedback from "@/src/components/ui/Feedback";

type Profile = { id: number; name: string; email: string };
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isDirty = Boolean(
    profile && (form.name !== profile.name || form.email !== profile.email),
  );

  useEffect(() => {
    getCurrentUser()
      .then((result) => {
        setProfile(result.user);
        setForm({ name: result.user.name, email: result.user.email });
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load profile"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (form.name.trim().length < 2)
      return setError("Name must be at least 2 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError("Enter a valid email address.");
    setSaving(true);
    try {
      const result = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setProfile(result.user);
      setForm({ name: result.user.name, email: result.user.email });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setSaving(false);
    }
  }

  function cancelChanges() {
    if (profile) setForm({ name: profile.name, email: profile.email });
    setError("");
    setMessage("");
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <SiteHeader />
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-slate-500 hover:text-emerald-600"
          >
            ← Back to dashboard
          </Link>
          <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Account
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Your profile
            </h1>
            <p className="mt-3 text-slate-500">
              Keep your account details current.
            </p>
            {loading ? (
              <p className="mt-8 text-slate-500">Loading profile...</p>
            ) : error && !profile ? (
              <p
                role="alert"
                className="mt-8 rounded-xl bg-red-50 p-4 text-red-700"
              >
                {error}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Name
                  </span>
                  <TextInput
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </span>
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    required
                  />
                </label>
                {error && <Feedback>{error}</Feedback>}
                {message && <Feedback tone="success">{message}</Feedback>}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    onClick={cancelChanges}
                    variant="secondary"
                  >
                    Cancel changes
                  </Button>
                  <Button type="submit" loading={saving} disabled={!isDirty}>
                    Save changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
