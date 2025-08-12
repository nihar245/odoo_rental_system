import { Router } from "express";
import { 
  createRentalRequest,
  getAllRentalRequests,
  getUserRentalRequests,
  approveRentalRequest,
  rejectRentalRequest,
  updatePaymentStatus,
  getRentalRequestById,
  cancelRentalRequest,
  confirmOrder
} from "../controllers/rentalRequest.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All rental request routes require authentication
router.use(verifyJWT);

// Create rental request (customer)
router.post("/", createRentalRequest);

// Get all rental requests (admin)
router.get("/all", getAllRentalRequests);

// Get user's rental requests (customer)
router.get("/user", getUserRentalRequests);

// Get rental request by ID
router.get("/:request_id", getRentalRequestById);

// Approve rental request (admin)
router.patch("/:request_id/approve", approveRentalRequest);

// Reject rental request (admin)
router.patch("/:request_id/reject", rejectRentalRequest);

// Update payment status
router.patch("/:request_id/payment", updatePaymentStatus);

// Confirm order and create reservation (admin)
router.patch("/:request_id/confirm", confirmOrder);

// Cancel rental request (customer)
router.patch("/:request_id/cancel", cancelRentalRequest);

export default router;
