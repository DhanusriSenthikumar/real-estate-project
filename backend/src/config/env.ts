import "dotenv/config";

const requiredEnvKeys = [
  "DATABASE_URL",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

type RequiredEnvKey = (typeof requiredEnvKeys)[number];

function getRequiredEnv(key: RequiredEnvKey): string {
  const value = process.env[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (key === "JWT_SECRET" && value.trim().length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  return value.trim();
}

function getOptionalEnv(key: string, fallback: string): string {
  const value = process.env[key];

  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  return value.trim();
}

export const env = {
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
  JWT_SECRET: getRequiredEnv("JWT_SECRET"),
  CLOUDINARY_CLOUD_NAME: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getRequiredEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getRequiredEnv("CLOUDINARY_API_SECRET"),
  FRONTEND_URL: getOptionalEnv("FRONTEND_URL", "http://localhost:3000"),
} as const;
