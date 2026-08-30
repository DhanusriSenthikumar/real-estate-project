import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  getMe,
  updateProfile,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
  skipSuccessfulRequests: false,
});

router.post("/users", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateProfile);

export default router;
