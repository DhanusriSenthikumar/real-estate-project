import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),

  description: z.string().optional(),

  price: z.number().positive("Price must be greater than 0"),

  location: z.string().min(2, "Location is required"),

  propertyType: z.enum(["HOUSE", "APARTMENT", "VILLA", "LAND"], {
    message: "Invalid property type",
  }),

  listingType: z.enum(["BUY", "RENT"], {
    message: "Listing type must be BUY or RENT",
  }),

  bedrooms: z.number().int().nonnegative("Bedrooms cannot be negative"),

  bathrooms: z.number().int().nonnegative("Bathrooms cannot be negative"),

  area: z.number().positive("Area must be greater than 0"),

  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const updatePropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),

  description: z.string().optional(),

  price: z.number().positive("Price must be greater than 0"),

  location: z.string().min(2, "Location is required"),

  propertyType: z.enum(["HOUSE", "APARTMENT", "VILLA", "LAND"]),

  listingType: z.enum(["BUY", "RENT"]),

  bedrooms: z.number().int().nonnegative("Bedrooms cannot be negative"),

  bathrooms: z.number().int().nonnegative("Bathrooms cannot be negative"),

  area: z.number().positive("Area must be greater than 0"),

  imageAction: z.enum(["remove"]).optional(),
});

export const propertyIdSchema = z.object({
  id: z.coerce.number().int().positive("Property ID must be a positive number"),
});

export const propertyQuerySchema = z
  .object({
    search: z.string().trim().optional(),

    location: z.string().trim().optional(),

    propertyType: z.preprocess(
      (value) => {
        if (typeof value === "string") return value.trim().toUpperCase();
        return value;
      },
      z.enum(["HOUSE", "APARTMENT", "VILLA", "LAND"]).optional(),
    ),

    listingType: z.preprocess(
      (value) => {
        if (typeof value === "string") return value.trim().toUpperCase();
        return value;
      },
      z.enum(["BUY", "RENT"]).optional(),
    ),

    bedrooms: z.coerce
      .number()
      .int()
      .min(0, "Bedrooms cannot be negative")
      .optional(),

    minPrice: z.coerce
      .number()
      .positive("Minimum price must be greater than 0")
      .optional(),

    maxPrice: z.coerce
      .number()
      .positive("Maximum price must be greater than 0")
      .optional(),

    sortBy: z.enum(["price", "bedrooms", "area", "createdAt"]).optional(),

    order: z.enum(["asc", "desc"]).optional(),

    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(10),
  })
  .superRefine((data, ctx) => {
    if (
      data.minPrice !== undefined &&
      data.maxPrice !== undefined &&
      data.minPrice > data.maxPrice
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minPrice"],
        message: "minPrice cannot be greater than maxPrice",
      });
    }
  });
