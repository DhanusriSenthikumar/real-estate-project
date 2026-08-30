import { z } from "zod";

const normalizedEmailSchema = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .pipe(z.string().email("Invalid email address"));

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  email: normalizedEmailSchema,

  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: normalizedEmailSchema,

  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: normalizedEmailSchema,
});
