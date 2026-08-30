import type { Request, Response } from "express";
import { or } from "@prisma/orm-family-sql/orm-client";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "../prisma/db.js";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyIdSchema,
  propertyQuerySchema,
} from "../validators/property.validator.js";
import cloudinary, { getCloudinaryTimestamp } from "../config/cloudinary.js";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return JSON.stringify(error);
}

export const getProperties = async (req: Request, res: Response) => {
  try {
    const result = propertyQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: result.error.issues,
      });
    }

    const {
      search,
      location,
      propertyType,
      listingType,
      bedrooms,
      minPrice,
      maxPrice,
      sortBy,
      order,
      page,
      limit,
    } = result.data;

    let query = db.orm.public.Property;

    if (location) {
      const locationTerm = `%${location.trim()}%`;
      query = query.where((p) => p.location.ilike(locationTerm));
    }

    if (propertyType) {
      query = query.where((p) => p.propertyType.eq(propertyType));
    }

    if (listingType) {
      query = query.where((p) => p.listingType.eq(listingType));
    }

    if (bedrooms !== undefined) {
      query = query.where((p) => p.bedrooms.eq(bedrooms));
    }

    if (minPrice !== undefined) {
      query = query.where((p) => p.price.gte(minPrice));
    }

    if (maxPrice !== undefined) {
      query = query.where((p) => p.price.lte(maxPrice));
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.where((p) =>
        or(
          p.title.ilike(searchTerm),
          p.location.ilike(searchTerm),
          p.description.ilike(searchTerm),
        ),
      );
    }

    if (sortBy) {
      if (sortBy === "price") {
        query =
          order === "desc"
            ? query.orderBy((p) => p.price.desc())
            : query.orderBy((p) => p.price.asc());
      }

      if (sortBy === "bedrooms") {
        query =
          order === "desc"
            ? query.orderBy((p) => p.bedrooms.desc())
            : query.orderBy((p) => p.bedrooms.asc());
      }

      if (sortBy === "area") {
        query =
          order === "desc"
            ? query.orderBy((p) => p.area.desc())
            : query.orderBy((p) => p.area.asc());
      }

      if (sortBy === "createdAt") {
        query =
          order === "desc"
            ? query.orderBy((p) => p.createdAt.desc())
            : query.orderBy((p) => p.createdAt.asc());
      }
    }

    const totalRows = await query
      .groupBy("id")
      .aggregate((agg) => ({ count: agg.count() }));

    const total = totalRows.reduce((sum, row) => sum + Number(row.count), 0);
    const startIndex = (page - 1) * limit;

    const properties = await query.offset(startIndex).limit(limit).all();

    return res.json({
      page,
      limit,
      total,
      properties,
    });
  } catch (error) {
    console.error("Get properties error:", error);

    res.status(500).json({
      message: "Failed to fetch properties",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const result = propertyIdSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid property ID",
        errors: result.error.issues,
      });
    }

    const { id } = result.data;

    const property = await db.orm.public.Property.where({ id }).first();

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    res.json(property);
  } catch (error) {
    console.error("Get property error:", error);

    res.status(500).json({
      message: "Failed to fetch property",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const properties = await db.orm.public.Property.where((p) =>
      p.userId.eq(userId),
    ).all();

    res.json({
      total: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Get my properties error:", error);

    res.status(500).json({
      message: "Failed to fetch your properties",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const result = createPropertySchema.safeParse({
      ...req.body,
      price: Number(req.body.price),
      bedrooms: Number(req.body.bedrooms),
      bathrooms: Number(req.body.bathrooms),
      area: Number(req.body.area),
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const {
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      propertyType,
      listingType,
    } = result.data;

    let imageUrl: string | null = null;

    // Upload image to Cloudinary
    if (req.file) {
      const cloudinaryTimestamp = await getCloudinaryTimestamp();
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "real-estate/properties",
            timestamp: cloudinaryTimestamp,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        stream.end(req.file!.buffer);
      });

      if (!uploadResult?.secure_url) {
        throw new Error("Image upload did not return a Cloudinary URL");
      }

      imageUrl = uploadResult.secure_url;
    }

    const property = await db.orm.public.Property.create({
      title,
      description: description ?? null,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      propertyType,
      listingType,
      imageUrl,
      userId,
    });

    return res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    return res.status(500).json({
      message: "Failed to create property",
      error: getErrorMessage(error),
    });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const idResult = propertyIdSchema.safeParse(req.params);

    if (!idResult.success) {
      return res.status(400).json({
        message: "Invalid property ID",
        errors: idResult.error.issues,
      });
    }

    const { id } = idResult.data;

    const result = updatePropertySchema.safeParse({
      ...req.body,
      price: Number(req.body.price),
      bedrooms: Number(req.body.bedrooms),
      bathrooms: Number(req.body.bathrooms),
      area: Number(req.body.area),
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const {
      title,
      description,
      price,
      location,
      propertyType,
      listingType,
      bedrooms,
      bathrooms,
      area,
      imageAction,
    } = result.data;

    const existingProperty = await db.orm.public.Property.where({ id }).first();

    if (!existingProperty) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    if (existingProperty.userId !== req.user?.userId) {
      return res.status(403).json({
        message: "You are not allowed to update this property",
      });
    }

    let nextImageUrl = existingProperty.imageUrl;

    if (imageAction === "remove") {
      nextImageUrl = null;
    }

    if (req.file) {
      const cloudinaryTimestamp = await getCloudinaryTimestamp();
      const uploadResult = await new Promise<{ secure_url?: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "real-estate/properties",
              timestamp: cloudinaryTimestamp,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result ?? {});
            },
          );

          stream.end(req.file!.buffer);
        },
      );

      if (!uploadResult.secure_url) {
        throw new Error("Image upload did not return a Cloudinary URL");
      }

      nextImageUrl = uploadResult.secure_url;
    }

    const updatedProperty = await db.orm.public.Property.where({ id }).update({
      title,
      description: description ?? null,
      price,
      location,
      propertyType,
      listingType,
      bedrooms,
      bathrooms,
      area,
      imageUrl: nextImageUrl,
    });

    res.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Update property error:", error);

    res.status(500).json({
      message: "Failed to update property",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const result = propertyIdSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid property ID",
        errors: result.error.issues,
      });
    }

    const { id } = result.data;

    // Get logged-in user's ID from JWT
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Find property
    const existingProperty = await db.orm.public.Property.where({ id }).first();

    if (!existingProperty) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Check ownership
    if (existingProperty.userId !== userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this property",
      });
    }

    // Delete property
    await db.orm.public.Property.where({ id }).delete();

    return res.json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    return res.status(500).json({
      message: "Failed to delete property",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
