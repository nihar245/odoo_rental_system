import { Router } from "express";
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  generatePickupDocument,
  generateReturnDocument,
  getCustomerReservations,
  cancelReservation
} from "../controllers/reservation.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Reservation management
router.post("/", createReservation);
router.get("/", getAllReservations);
router.get("/customer/:customer_id", getCustomerReservations);
router.get("/:id", getReservationById);
router.patch("/:id/status", updateReservationStatus);
router.delete("/:id", cancelReservation);

// Document generation
router.get("/:id/pickup-document", generatePickupDocument);
router.get("/:id/return-document", generateReturnDocument);

export default router;
