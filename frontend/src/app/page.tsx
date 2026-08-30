"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropertyCard from "@/src/components/PropertyCard";
import SiteHeader from "@/src/components/SiteHeader";
import {
  getProperties,
  isAuthenticated,
  subscribeToAuthChanges,
} from "@/src/lib/api";
import type { Property } from "@/src/types/property";

export default function HomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");
  const [listingType, setListingType] = useState("BUY");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const sync = () => setAuthenticated(isAuthenticated());
    sync();
    return subscribeToAuthChanges(sync);
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (listingType) params.set("listingType", listingType);
    if (location.trim()) params.set("location", location.trim());
    if (propertyType) params.set("propertyType", propertyType);
    router.push(`/properties?${params.toString()}`);
  }

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getProperties();
        setProperties((data.properties ?? []).slice(0, 6));
      } catch (error) {
        console.error(error);
        setFeaturedError("Featured properties are temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_35%),linear-gradient(135deg,#0f172a_0%,#111827_38%,#0f172a_100%)] text-white">
        <SiteHeader dark />
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid items-center gap-12 pb-16 pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:pt-20">
            <div>
              <span className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                Discover your next address
              </span>

              <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Find the right place to call home.
              </h1>

              <p className="mt-6 max-w-xl text-base text-slate-300 lg:text-lg">
                Discover modern homes, apartments, and investment-ready
                properties in the most sought-after neighborhoods.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/properties"
                  className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Browse listings
                </Link>
                {!authenticated && (
                  <Link
                    href="/register"
                    className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Create account
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
              <div className="overflow-hidden rounded-[1.5rem]">
                <div className="relative h-[420px] w-full bg-[url('https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <form
          onSubmit={handleSearch}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Buy / Rent
              </label>
              <div className="flex rounded-xl bg-slate-200 p-1 text-sm font-medium text-slate-700">
                <button
                  type="button"
                  onClick={() => setListingType("BUY")}
                  className={`flex-1 rounded-lg px-3 py-2 ${listingType === "BUY" ? "bg-white shadow-sm" : ""}`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setListingType("RENT")}
                  className={`flex-1 rounded-lg px-3 py-2 ${listingType === "RENT" ? "bg-white shadow-sm" : ""}`}
                >
                  Rent
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or area"
                className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Property type
              </label>
              <select
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
                className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="">Any type</option>
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="HOUSE">House</option>
              </select>
            </div>

            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="w-48 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Featured homes
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Homes people are loving right now
            </h2>
          </div>

          <Link
            href="/properties"
            className="text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            View all properties →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[360px] animate-pulse rounded-[2rem] bg-slate-200"
              />
            ))}
          </div>
        ) : featuredError ? (
          <div
            role="alert"
            className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
          >
            {featuredError}
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            No featured properties are available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Why us
            </p>
            <h3 className="mt-4 text-3xl font-bold">
              A better way to buy and sell.
            </h3>
          </div>

          {[
            "Trusted property listings",
            "Easy property discovery",
            "Secure account access",
            "Simple property management",
          ].map((benefit) => (
            <div
              key={benefit}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <p className="text-2xl font-bold">{benefit}</p>
              <p className="mt-3 text-slate-300">
                A focused experience that keeps the important property workflow
                clear and easy to use.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
