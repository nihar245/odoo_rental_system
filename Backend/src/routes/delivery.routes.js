import { Router } from "express";
import {
  getAllDeliveries,
  getDeliveryById,
  assignTeamMember,
  updateDeliveryStatus,
  getDeliveriesByTeamMember,
  getUrgentDeliveries,
  generateDeliveryDocument,
  getDeliveryStats
} from "../controllers/delivery.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Delivery management
router.get("/", getAllDeliveries);
router.get("/stats", getDeliveryStats);
router.get("/urgent", getUrgentDeliveries);
router.get("/team-member/:team_member_id", getDeliveriesByTeamMember);
router.get("/:id", getDeliveryById);

// Team member operations
router.patch("/:id/assign", assignTeamMember);
router.patch("/:id/status", updateDeliveryStatus);

// Document generation
router.get("/:id/document", generateDeliveryDocument);

export default router;
