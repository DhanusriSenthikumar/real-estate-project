import type { Property } from "@/src/types/property";

export default function PropertyStats({
  property,
}: {
  property: Pick<Property, "propertyType" | "bedrooms" | "bathrooms" | "area">;
}) {
  const stats = [
    ["Property type", property.propertyType],
    ["Bedrooms", `${property.bedrooms} BHK`],
    ["Bathrooms", String(property.bathrooms)],
    ["Area", `${property.area} sq.ft`],
  ];
  return (
    <div className="grid grid-cols-2 gap-4 border-y border-slate-200 py-6 sm:grid-cols-4">
      {stats.map(([label, value]) => (
        <div key={label}>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 font-semibold text-slate-900">{value}</p>
        </div>
      ))}
    </div>
  );
}
