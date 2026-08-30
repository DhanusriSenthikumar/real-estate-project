"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import {
  deleteProperty,
  getCurrentUser,
  getMyProperties,
  updateProfile,
} from "@/src/lib/api";
import SiteHeader from "@/src/components/SiteHeader";
import PropertyCard from "@/src/components/PropertyCard";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import { ButtonLink } from "@/src/components/ui/Button";
import Feedback from "@/src/components/ui/Feedback";
import type { Property } from "@/src/types/property";

type Profile = { id: number; name: string; email: string };

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [propertyData, profileData] = await Promise.all([
          getMyProperties(),
          getCurrentUser(),
        ]);
        setProperties(propertyData.properties ?? []);
        setProfile(profileData.user);
        setProfileForm({
          name: profileData.user.name,
          email: profileData.user.email,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");

    try {
      const result = await updateProfile(profileForm);
      setProfile(result.user);
      setProfileForm({ name: result.user.name, email: result.user.email });
      setEditingProfile(false);
      setProfileMessage("Profile updated successfully");
    } catch (err) {
      setProfileMessage(
        err instanceof Error ? err.message : "Profile update failed",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDelete(property: Property) {
    setPendingDelete(property);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const property = pendingDelete;
    setDeletingId(property.id);
    setPendingDelete(null);
    setError("");
    setDeleteMessage("");
    try {
      await deleteProperty(property.id);
      const refreshed = await getMyProperties();
      setProperties(refreshed.properties ?? []);
      setDeleteMessage("Property deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete property",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SiteHeader />
          </div>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Dashboard
              </p>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">
                Your property portfolio
              </h1>
            </div>

            <ButtonLink
              href="/dashboard/properties/new"
              className="w-full rounded-full sm:w-auto"
            >
              + Publish property
            </ButtonLink>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Your listings</p>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {properties.length}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Views</p>
              <p className="mt-4 text-3xl font-bold text-slate-900">3.1k</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Response rate</p>
              <p className="mt-4 text-3xl font-bold text-slate-900">96%</p>
            </div>
          </div>

          <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Profile
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {profile?.name || "Your account"}
                </h2>
              </div>
              {!editingProfile && profile && (
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit profile
                </button>
              )}
            </div>

            {profile && !editingProfile && (
              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-slate-500">Name</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.email}
                  </p>
                </div>
              </div>
            )}

            {editingProfile && (
              <form
                onSubmit={handleProfileSubmit}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <input
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm({ ...profileForm, name: event.target.value })
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Full name"
                  required
                />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      email: event.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Email"
                  required
                />
                <div className="flex gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {savingProfile ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {profileMessage && (
              <p className="mt-4 text-sm text-emerald-600">{profileMessage}</p>
            )}
          </section>

          {loading ? (
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              Loading your listings...
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-red-50 p-6 text-red-600 ring-1 ring-red-200">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
              You have no published properties yet.
            </div>
          ) : (
            <>
              {deleteMessage && (
                <div className="mb-4">
                  <Feedback tone="success">{deleteMessage}</Feedback>
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant="owner"
                    deleting={deletingId === property.id}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <ConfirmDialog
          open={Boolean(pendingDelete)}
          title="Delete this property?"
          description={
            pendingDelete
              ? `This will permanently remove “${pendingDelete.title}” from your listings.`
              : ""
          }
          loading={Boolean(deletingId)}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      </main>
    </AuthGuard>
  );
}
