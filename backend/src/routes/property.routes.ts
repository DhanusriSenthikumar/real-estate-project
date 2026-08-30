import { Router } from "express";

import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
} from "../controllers/property.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// PUBLIC routes
router.get("/", getProperties);

// PROTECTED routes
router.get("/my", authMiddleware, getMyProperties);

router.get("/:id", getPropertyById);

router.post("/", authMiddleware, upload.single("image"), createProperty);

router.put("/:id", authMiddleware, upload.single("image"), updateProperty);

router.delete("/:id", authMiddleware, deleteProperty);

export default router;
