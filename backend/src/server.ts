import express from "express";
import cors from "cors";
import multer from "multer";
import { env } from "./config/env.js";
import { db } from "./prisma/db.js";

import propertyRoutes from "./routes/property.routes.js";
import authRoutes from "./routes/auth.routes.js";

void env;

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Real Estate Backend is running",
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Image must be 5 MB or smaller"
            : "Invalid image upload",
      });
    }

    if (
      error instanceof Error &&
      error.message === "Only image files are allowed"
    ) {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  },
);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
