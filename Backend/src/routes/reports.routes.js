import { Router } from "express";
import {
  getOrderSummary,
  getDashboardReport
} from "../controllers/reports.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Dashboard report (quick overview)
router.get("/dashboard", getDashboardReport);

// Order summary report
router.get("/order-summary", getOrderSummary);

export default router;
