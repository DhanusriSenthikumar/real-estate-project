"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import SiteHeader from "@/src/components/SiteHeader";
import { createProperty } from "@/src/lib/api";
import { Button } from "@/src/components/ui/Button";
import Feedback from "@/src/components/ui/Feedback";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white";
type FieldErrors = Partial<
  Record<
    | "title"
    | "description"
    | "price"
    | "location"
    | "bedrooms"
    | "bathrooms"
    | "area"
    | "image",
    string
  >
>;

export default function NewPropertyPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState("BUY");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: FieldErrors = {};
    const file = formData.get("image");

    if (
      typeof formData.get("title") !== "string" ||
      String(formData.get("title")).trim().length < 3
    )
      nextErrors.title = "Title must be at least 3 characters.";
    if (
      typeof formData.get("location") !== "string" ||
      String(formData.get("location")).trim().length < 2
    )
      nextErrors.location = "Enter a valid location.";
    if (Number(formData.get("price")) <= 0)
      nextErrors.price = "Price must be greater than zero.";
    if (Number(formData.get("bedrooms")) < 0)
      nextErrors.bedrooms = "Bedrooms cannot be negative.";
    if (Number(formData.get("bathrooms")) < 0)
      nextErrors.bathrooms = "Bathrooms cannot be negative.";
    if (Number(formData.get("area")) <= 0)
      nextErrors.area = "Area must be greater than zero.";
    if (file instanceof File && file.size > 5 * 1024 * 1024)
      nextErrors.image = "Image must be 5 MB or smaller.";
    if (
      file instanceof File &&
      file.size > 0 &&
      !file.type.startsWith("image/")
    )
      nextErrors.image = "Select an image file.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setMessage("");
    formData.set("listingType", listingType);

    try {
      await createProperty(formData);
      setMessage("Property published successfully. Redirecting...");
      window.setTimeout(() => router.push("/dashboard"), 700);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to publish property",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, image: "Select an image file." }));
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        image: "Image must be 5 MB or smaller.",
      }));
      event.target.value = "";
      return;
    }
    setErrors((current) => ({ ...current, image: undefined }));
    setImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function removeImage() {
    setImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    const input = document.querySelector<HTMLInputElement>(
      'input[name="image"]',
    );
    if (input) input.value = "";
  }

  function errorFor(field: keyof FieldErrors) {
    return errors[field] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null;
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-50 px-6 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <SiteHeader />
          </div>

          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-500 hover:text-emerald-600"
            >
              ← Back to dashboard
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              New listing
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Publish your property
            </h1>
            <p className="mt-3 text-slate-500">
              Add the details buyers and renters need to find your property.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Property title
                </span>
                <input
                  name="title"
                  className={inputClass}
                  placeholder="Beautiful 3BHK Villa"
                  required
                  minLength={3}
                />
                {errorFor("title")}
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </span>
                <input
                  name="location"
                  className={inputClass}
                  placeholder="Erode"
                  required
                  minLength={2}
                />
                {errorFor("location")}
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Price
                </span>
                <input
                  name="price"
                  type="number"
                  min="1"
                  step="0.01"
                  className={inputClass}
                  placeholder="5000000"
                  required
                />
                {errorFor("price")}
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Property type
                </span>
                <select
                  name="propertyType"
                  className={inputClass}
                  defaultValue="VILLA"
                >
                  <option value="HOUSE">House</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="LAND">Land</option>
                </select>
              </label>

              <fieldset>
                <legend className="mb-2 block text-sm font-semibold text-slate-700">
                  Listing
                </legend>
                <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
                  {[
                    ["BUY", "Buy"],
                    ["RENT", "Rent"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setListingType(value)}
                      className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition ${listingType === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Bedrooms / BHK
                </span>
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  placeholder="3"
                  required
                />
                {errorFor("bedrooms")}
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Bathrooms
                </span>
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  placeholder="2"
                  required
                />
                {errorFor("bathrooms")}
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Area (sq.ft)
                </span>
                <input
                  name="area"
                  type="number"
                  min="1"
                  step="0.01"
                  className={inputClass}
                  placeholder="2000"
                  required
                />
                {errorFor("area")}
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </span>
                <textarea
                  name="description"
                  rows={5}
                  className={inputClass}
                  placeholder="Describe the property, amenities, and nearby places."
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Property image
                </span>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:font-semibold file:text-emerald-800"
                />
                {errorFor("image")}
                {imagePreview && (
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative h-24 w-32 overflow-hidden rounded-xl">
                      <Image
                        src={imagePreview}
                        alt="Selected property preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </label>
            </div>

            {message && (
              <div className="mt-5">
                <Feedback
                  tone={
                    message.startsWith("Property published")
                      ? "success"
                      : "error"
                  }
                >
                  {message}
                </Feedback>
              </div>
            )}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <Button type="submit" loading={loading}>
                Publish property
              </Button>
            </div>
          </form>
        </div>
      </main>
    </AuthGuard>
  );
}
