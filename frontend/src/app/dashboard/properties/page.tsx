"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import SiteHeader from "@/src/components/SiteHeader";
import { deleteProperty, getMyProperties } from "@/src/lib/api";
import PropertyCard from "@/src/components/PropertyCard";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import Feedback from "@/src/components/ui/Feedback";
import type { Property } from "@/src/types/property";

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);

  useEffect(() => {
    getMyProperties()
      .then((data) => setProperties(data.properties ?? []))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load properties",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function removeProperty(property: Property) {
    setPendingDelete(property);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const property = pendingDelete;
    setDeletingId(property.id);
    setPendingDelete(null);
    setError("");
    setMessage("");
    try {
      await deleteProperty(property.id);
      setProperties((current) =>
        current.filter((item) => item.id !== property.id),
      );
      setMessage("Property deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete property",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SiteHeader />
          </div>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Portfolio
              </p>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">
                My properties
              </h1>
              <p className="mt-3 text-slate-500">
                Manage the listings you have published.
              </p>
            </div>
            <Link
              href="/dashboard/properties/new"
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Add property
            </Link>
          </div>
          {message && (
            <div className="mb-4">
              <Feedback tone="success">{message}</Feedback>
            </div>
          )}
          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-slate-500">
              Loading your properties...
            </div>
          ) : error ? (
            <p role="alert" className="rounded-3xl bg-red-50 p-8 text-red-700">
              {error}
            </p>
          ) : properties.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                No properties yet
              </h2>
              <p className="mt-2 text-slate-500">
                Publish your first property to start your portfolio.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  variant="owner"
                  deleting={deletingId === property.id}
                  onDelete={removeProperty}
                />
              ))}
            </div>
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
