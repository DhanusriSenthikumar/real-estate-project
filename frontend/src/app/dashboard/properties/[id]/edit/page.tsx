"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import SiteHeader from "@/src/components/SiteHeader";
import PropertyImage from "@/src/components/PropertyImage";
import { getPropertyById, updateProperty } from "@/src/lib/api";
import type { ListingType, Property, PropertyType } from "@/src/types/property";
import Feedback from "@/src/components/ui/Feedback";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:bg-white";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    propertyType: "VILLA" as PropertyType,
    listingType: "BUY" as ListingType,
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialForm, setInitialForm] = useState(form);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isDirty =
    JSON.stringify(form) !== JSON.stringify(initialForm) ||
    selectedImage !== null ||
    removeImage;

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    getPropertyById(Number(params.id))
      .then((data) => {
        const item = data.property ?? data;
        setProperty(item);
        const loadedForm = {
          title: item.title,
          location: item.location,
          price: String(item.price),
          propertyType: item.propertyType ?? "VILLA",
          listingType: item.listingType ?? "BUY",
          bedrooms: String(item.bedrooms),
          bathrooms: String(item.bathrooms),
          area: String(item.area),
          description: item.description ?? "",
        };
        setForm(loadedForm);
        setInitialForm(loadedForm);
      })
      .catch((error) =>
        setMessage(
          error instanceof Error ? error.message : "Failed to load property",
        ),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  function change(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (form.title.trim().length < 3)
      return setMessage("Title must be at least 3 characters.");
    if (form.location.trim().length < 2)
      return setMessage("Enter a valid location.");
    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0)
      return setMessage("Price must be greater than zero.");
    if (!Number.isInteger(Number(form.bedrooms)) || Number(form.bedrooms) < 0)
      return setMessage("Bedrooms must be a non-negative whole number.");
    if (!Number.isInteger(Number(form.bathrooms)) || Number(form.bathrooms) < 0)
      return setMessage("Bathrooms must be a non-negative whole number.");
    if (!Number.isFinite(Number(form.area)) || Number(form.area) <= 0)
      return setMessage("Area must be greater than zero.");
    setSaving(true);
    setMessage("");
    try {
      await updateProperty(Number(params.id), {
        ...form,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area),
        image: selectedImage ?? undefined,
        removeImage,
      });
      router.push("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update property",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-50 px-6 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <SiteHeader />
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-slate-500 hover:text-emerald-600"
          >
            ← Back to dashboard
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Manage listing
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Edit property
          </h1>
          {loading ? (
            <p className="mt-8 text-slate-500">Loading property...</p>
          ) : property ? (
            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Property title
                  </span>
                  <input
                    value={form.title}
                    onChange={(event) => change("title", event.target.value)}
                    className={inputClass}
                    required
                    minLength={3}
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Property image
                  </span>
                  <span className="mb-2 ml-3 text-xs text-slate-500">
                    Optional · JPG, PNG or WEBP · Maximum size 5MB
                  </span>
                  <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                    <div className="relative aspect-[16/7] min-h-48">
                      {localPreview ? (
                        <Image
                          src={localPreview}
                          alt="New property image preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : removeImage ? (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          Image will be removed when you save.
                        </div>
                      ) : property.imageUrl ? (
                        <PropertyImage
                          src={property.imageUrl}
                          alt={`${property.title} current image`}
                          sizes="(max-width: 768px) 100vw, 900px"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-slate-500">
                          <span className="text-3xl" aria-hidden="true">
                            ⌂
                          </span>
                          <strong className="text-slate-700">
                            Add property image
                          </strong>
                          <span className="text-sm">
                            Upload a JPG, PNG or WEBP image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white p-4">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          if (!file.type.startsWith("image/"))
                            return setMessage(
                              "Please select a valid image file.",
                            );
                          if (file.size > 5 * 1024 * 1024)
                            return setMessage("Image must be 5 MB or smaller.");
                          setMessage("");
                          setRemoveImage(false);
                          setSelectedImage(file);
                          setLocalPreview((current) => {
                            if (current) URL.revokeObjectURL(current);
                            return URL.createObjectURL(file);
                          });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        {property.imageUrl && !removeImage
                          ? "Change image"
                          : "Choose image"}
                      </button>
                      {(property.imageUrl || selectedImage) && !removeImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setRemoveImage(true);
                            setSelectedImage(null);
                            setLocalPreview((current) => {
                              if (current) URL.revokeObjectURL(current);
                              return null;
                            });
                          }}
                          className="rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Remove image
                        </button>
                      )}
                      {removeImage && (
                        <button
                          type="button"
                          onClick={() => setRemoveImage(false)}
                          className="rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Keep current image
                        </button>
                      )}
                    </div>
                  </div>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Location
                  </span>
                  <input
                    value={form.location}
                    onChange={(event) => change("location", event.target.value)}
                    className={inputClass}
                    required
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Price
                  </span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(event) => change("price", event.target.value)}
                    className={inputClass}
                    required
                    min="1"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Property type
                  </span>
                  <select
                    value={form.propertyType}
                    onChange={(event) =>
                      change("propertyType", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="HOUSE">House</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                    <option value="LAND">Land</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Listing
                  </span>
                  <select
                    value={form.listingType}
                    onChange={(event) =>
                      change("listingType", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="BUY">Buy</option>
                    <option value="RENT">Rent</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Bedrooms / BHK
                  </span>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={(event) => change("bedrooms", event.target.value)}
                    className={inputClass}
                    required
                    min="0"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Bathrooms
                  </span>
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={(event) =>
                      change("bathrooms", event.target.value)
                    }
                    className={inputClass}
                    required
                    min="0"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Area (sq.ft)
                  </span>
                  <input
                    type="number"
                    value={form.area}
                    onChange={(event) => change("area", event.target.value)}
                    className={inputClass}
                    required
                    min="1"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      change("description", event.target.value)
                    }
                    rows={5}
                    className={inputClass}
                  />
                </label>
              </div>
              {message && (
                <div className="mt-5">
                  <Feedback tone="error">{message}</Feedback>
                </div>
              )}
              <div className="mt-8 flex gap-3 sm:justify-end">
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 sm:flex-none"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="flex-1 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <p
              role="alert"
              className="mt-8 rounded-xl bg-red-50 p-4 text-red-700"
            >
              {message || "Property could not be loaded."}
            </p>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
