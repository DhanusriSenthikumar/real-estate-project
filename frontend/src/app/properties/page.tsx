"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/src/components/PropertyCard";
import { getProperties } from "@/src/lib/api";
import type { Property } from "@/src/types/property";
import SiteHeader from "@/src/components/SiteHeader";
import PageContainer from "@/src/components/ui/PageContainer";
import { EmptyState, ErrorState } from "@/src/components/ui/FeedbackStates";

type SortValue =
  | "createdAt-desc"
  | "createdAt-asc"
  | "price-desc"
  | "price-asc"
  | "bedrooms-desc"
  | "bedrooms-asc"
  | "area-desc"
  | "area-asc";

const defaultFilters = {
  search: "",
  location: "",
  listingType: "",
  propertyType: "",
  bedrooms: "",
  minPrice: "",
  maxPrice: "",
  sort: "createdAt-desc" as SortValue,
};

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    search: searchParams.get("search") ?? "",
    location: searchParams.get("location") ?? "",
    listingType: searchParams.get("listingType") ?? "",
    propertyType: searchParams.get("propertyType") ?? "",
  }));
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 12;

  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const requestIdRef = useRef(0);

  const sortBy = useMemo(() => {
    if (filters.sort.startsWith("price")) return "price" as const;
    if (filters.sort.startsWith("bedrooms")) return "bedrooms" as const;
    if (filters.sort.startsWith("area")) return "area" as const;
    return "createdAt" as const;
  }, [filters.sort]);

  const order = useMemo(
    () => (filters.sort.endsWith("asc") ? "asc" : "desc"),
    [filters.sort],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);

      setFilters((current) => ({
        ...current,
        search: searchInput.trim(),
      }));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    async function loadProperties() {
      setLoading(true);
      setError("");

      try {
        const data = await getProperties({
          search: filters.search || undefined,
          location: filters.location || undefined,
          listingType: filters.listingType || undefined,
          propertyType: filters.propertyType || undefined,
          bedrooms:
            filters.bedrooms !== "" ? Number(filters.bedrooms) : undefined,
          minPrice:
            filters.minPrice !== "" ? Number(filters.minPrice) : undefined,
          maxPrice:
            filters.maxPrice !== "" ? Number(filters.maxPrice) : undefined,
          sortBy,
          order,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setProperties(data.properties ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error(err);
        setError("Unable to load properties right now. Please try again.");
        setProperties([]);
        setTotal(0);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setHasLoadedOnce(true);
        }
      }
    }

    loadProperties();
  }, [
    filters.search,
    filters.location,
    filters.listingType,
    filters.minPrice,
    filters.maxPrice,
    filters.propertyType,
    filters.bedrooms,
    sortBy,
    order,
    currentPage,
  ]);

  const handleInputChange =
    (field: keyof typeof defaultFilters) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;

      setCurrentPage(1);

      setFilters((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const clearFilters = () => {
    setCurrentPage(1);
    setSearchInput("");
    setFilters(defaultFilters);
  };

  const shouldShowSkeleton = !hasLoadedOnce && loading;
  const isFiltering = hasLoadedOnce && loading;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <PageContainer>
        <div className="mb-8">
          <SiteHeader />
        </div>
        <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Real estate marketplace
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Find your next place
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-200 sm:text-base">
                Browse handpicked homes and investment-ready properties in the
                places you love most.
              </p>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-emerald-50 backdrop-blur-sm">
              {total} property{total === 1 ? "" : "ies"} found
            </div>
          </div>
        </div>

        <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <div className="xl:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Search
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="City, title, or keyword"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={handleInputChange("location")}
                placeholder="Erode"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Property type
              </label>
              <select
                value={filters.propertyType}
                onChange={handleInputChange("propertyType")}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              >
                <option value="">Any type</option>
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="LAND">Land</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Bedrooms
              </label>
              <select
                value={filters.bedrooms}
                onChange={handleInputChange("bedrooms")}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Sort by
              </label>
              <select
                value={filters.sort}
                onChange={handleInputChange("sort")}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="price-desc">Price: High to low</option>
                <option value="price-asc">Price: Low to high</option>
                <option value="bedrooms-desc">Bedrooms: High to low</option>
                <option value="bedrooms-asc">Bedrooms: Low to high</option>
                <option value="area-desc">Area: High to low</option>
                <option value="area-asc">Area: Low to high</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Min price
              </label>
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={handleInputChange("minPrice")}
                placeholder="₹500000"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Max price
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={handleInputChange("maxPrice")}
                placeholder="₹5000000"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex items-end md:col-span-1 xl:col-span-2">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Clear filters
              </button>
            </div>
          </div>
        </section>

        {shouldShowSkeleton ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[360px] animate-pulse rounded-[2rem] bg-slate-200 shadow-sm"
              />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : properties.length === 0 ? (
          <EmptyState
            title="No properties match your search"
            message="Try adjusting your filters or clearing the current search."
          />
        ) : (
          <>
            <div
              aria-busy={isFiltering}
              className={`grid gap-6 transition-opacity duration-300 md:grid-cols-2 xl:grid-cols-3 ${
                isFiltering ? "opacity-60" : "opacity-100"
              }`}
            >
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}

              {isFiltering && (
                <p className="sr-only" role="status">
                  Updating results
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage === 1 || loading}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition ${
                        currentPage === page
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || loading}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-600 sm:px-6 lg:px-8">
          Loading properties...
        </main>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
