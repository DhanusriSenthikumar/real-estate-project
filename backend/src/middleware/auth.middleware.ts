import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";

export interface AuthUser {
  userId: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const authUserSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
});

function validateAuthPayload(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const parsed = authUserSchema.safeParse({
    ...(payload as Record<string, unknown>),
    email:
      typeof (payload as Record<string, unknown>).email === "string"
        ? String((payload as Record<string, unknown>).email)
            .trim()
            .toLowerCase()
        : undefined,
  });

  if (!parsed.success) {
    return null;
  }

  return {
    userId: parsed.data.userId,
    email: parsed.data.email,
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const match = authHeader.match(/^Bearer\s+([^\s]+)$/i);
    const token = match?.[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    const validatedUser = validateAuthPayload(decoded);

    if (!validatedUser) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.user = validatedUser;

    next();
  } catch (_error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
