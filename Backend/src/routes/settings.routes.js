import { Router } from "express";
import { 
  getUserSettings,
  updateNotificationPreferences,
  updateBusinessSettings,
  getAllUsersSettings,
  resetUserSettings,
  getNotificationStats
} from "../controllers/settings.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All settings routes require authentication
router.use(verifyJWT);

// Get user settings
router.get("/", getUserSettings);

// Get notification statistics
router.get("/stats", getNotificationStats);

// Update notification preferences
router.patch("/notifications", updateNotificationPreferences);

// Update business settings (admin only)
router.patch("/business", updateBusinessSettings);

// Get all users' settings (admin only)
router.get("/all-users", getAllUsersSettings);

// Reset user settings to defaults
router.post("/reset", resetUserSettings);

export default router;
