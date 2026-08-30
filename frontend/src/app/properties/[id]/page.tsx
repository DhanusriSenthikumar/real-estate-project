import { notFound } from "next/navigation";
import type { Property } from "@/src/types/property";
import { getPropertyById } from "@/src/lib/api";
import SiteHeader from "@/src/components/SiteHeader";
import PropertyImage from "@/src/components/PropertyImage";
import BackLink from "@/src/components/ui/BackLink";
import PageContainer from "@/src/components/ui/PageContainer";
import PropertyStats from "@/src/components/ui/PropertyStats";

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let property: Property;
  try {
    property = await getPropertyById(Number(id));
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <PageContainer className="max-w-6xl">
        <div className="mb-8">
          <SiteHeader />
        </div>
        <div className="mb-6">
          <BackLink href="/properties">Back to properties</BackLink>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-slate-200">
          <div className="relative aspect-[16/9] min-h-[280px] w-full bg-slate-200 sm:aspect-[2/1] lg:aspect-[2.2/1]">
            <PropertyImage
              src={property.imageUrl}
              alt={`${property.title} in ${property.location}`}
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            <span className="absolute left-5 top-5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg">
              {property.listingType}
            </span>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  {property.propertyType}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  {property.title}
                </h1>
                <p className="mt-3 text-base text-slate-500">
                  <span aria-hidden="true">Location: </span>
                  {property.location}
                </p>
              </div>
              <p className="text-3xl font-bold text-slate-900 sm:text-4xl">
                ₹{property.price.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-8">
              <PropertyStats property={property} />
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  About this property
                </h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                  {property.description || "No description available."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
