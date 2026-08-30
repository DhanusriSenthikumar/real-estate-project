export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "VILLA"
  | "LAND";

export type ListingType = "BUY" | "RENT";

export interface Property {
  id: number;
  title: string;
  description: string | null;
  price: number;
  location: string;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrl: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}