import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db } from "../prisma/db.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const register = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const { name, email, password } = result.data;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await db.orm.public.User.where((u) =>
      u.email.eq(normalizedEmail),
    ).first();

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.orm.public.User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (_error) {
    console.error("Register error:", _error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const { email, password } = result.data;
    const normalizedEmail = normalizeEmail(email);

    const user = await db.orm.public.User.where((u) =>
      u.email.eq(normalizedEmail),
    ).first();

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      },
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (_error) {
    console.error("Login error:", _error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const user = await db.orm.public.User.where({ id: userId }).first();

    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (_error) {
    console.error("Get current user error:", _error);

    return res.status(500).json({
      message: "Failed to get current user",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const normalizedEmail = normalizeEmail(result.data.email);

    const existingUser = await db.orm.public.User.where((user) =>
      user.email.eq(normalizedEmail),
    ).first();

    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await db.orm.public.User.where({ id: userId }).update({
      ...result.data,
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (_error) {
    console.error("Update profile error:", _error);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};
