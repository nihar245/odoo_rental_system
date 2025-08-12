import { Router } from "express";
import {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
  getCustomerInvoices,
  processPayment,
  updateLateFees,
  generateInvoiceDocument,
  deleteInvoice
} from "../controllers/invoice.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Admin routes
router.post("/", createInvoice);
router.get("/all", getAllInvoices);
router.get("/:invoice_id", getInvoiceById);
router.patch("/:invoice_id/payment", processPayment);
router.patch("/update-late-fees", updateLateFees);
router.get("/:invoice_id/document", generateInvoiceDocument);
router.delete("/:invoice_id", deleteInvoice);

// Customer routes
router.get("/customer/invoices", getCustomerInvoices);

export default router;
