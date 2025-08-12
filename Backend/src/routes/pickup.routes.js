import { Router } from "express";
import { 
  createPickup,
  getAllPickups,
  getUserPickups,
  getPickupById,
  assignTeamMember,
  updatePickupStatus,
  addSignature,
  generatePickupDocument,
  getPickupStats
} from "../controllers/pickup.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All pickup routes require authentication
router.use(verifyJWT);

// Create pickup record
router.post("/", createPickup);

// Get all pickups (admin)
router.get("/all", getAllPickups);

// Get user's pickups (customer)
router.get("/user", getUserPickups);

// Get pickup by ID
router.get("/:id", getPickupById);

// Assign team member
router.patch("/:pickup_id/assign", assignTeamMember);

// Update pickup status
router.patch("/:pickup_id/status", updatePickupStatus);

// Add signature
router.patch("/:pickup_id/signature", addSignature);

// Generate pickup document
router.get("/:pickup_id/document", generatePickupDocument);

// Get pickup statistics
router.get("/stats/overview", getPickupStats);

export default router;
