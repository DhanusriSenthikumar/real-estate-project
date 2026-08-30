import type { Property } from "../types/property";
import PropertyImage from "./PropertyImage";
import { Badge, Card } from "./ui/Card";
import { ButtonLink } from "./ui/Button";
import { Button } from "./ui/Button";

interface PropertyCardProps {
  property: Property;
  variant?: "public" | "owner";
  onDelete?: (property: Property) => void;
  deleting?: boolean;
}

export default function PropertyCard({
  property,
  variant = "public",
  onDelete,
  deleting = false,
}: PropertyCardProps) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-56 bg-gray-100">
        <PropertyImage
          src={property.imageUrl}
          alt={`${property.title} property in ${property.location}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <span className="absolute left-4 top-4">
          <Badge>{property.listingType}</Badge>
        </span>
      </div>

      {/* Details */}
      <div className="p-5">
        <p className="text-sm text-gray-500">
          {property.propertyType} · {property.location}
        </p>

        <h3 className="mt-2 text-xl font-semibold text-gray-900">
          {property.title}
        </h3>

        <p className="mt-2 text-lg font-bold text-gray-900">
          ₹{property.price.toLocaleString("en-IN")}
        </p>

        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <span>{property.bedrooms} Beds</span>
          <span>{property.bathrooms} Baths</span>
          <span>{property.area} sq.ft</span>
        </div>

        {variant === "owner" ? (
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <ButtonLink href={`/properties/${property.id}`} className="w-full">
              View
            </ButtonLink>
            <ButtonLink
              href={`/dashboard/properties/${property.id}/edit`}
              variant="secondary"
              className="w-full"
            >
              Edit
            </ButtonLink>
            <Button
              type="button"
              variant="destructive"
              loading={deleting}
              onClick={() => onDelete?.(property)}
              className="w-full"
            >
              Delete
            </Button>
          </div>
        ) : (
          <ButtonLink
            href={`/properties/${property.id}`}
            className="mt-5 w-full"
          >
            View
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}
