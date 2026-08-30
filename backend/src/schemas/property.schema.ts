import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  price: z.number().positive("Price must be greater than 0"),
  location: z.string().min(1, "Location is required"),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  area: z.number().positive("Area must be greater than 0"),
});
