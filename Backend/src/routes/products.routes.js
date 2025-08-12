import { Router } from "express";
import { addProduct, listProducts, updateStock, deleteProduct, updateProduct, getProductById } from "../controllers/products.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

// Create product (multipart/form-data), accepts image file field name 'image'
router.post("/", upload.single("image"), addProduct);

// Update stock
router.patch("/:id/stock", updateStock);

// Update product
router.put("/:id", upload.single("image"), updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

// Get single product
router.get("/:id", getProductById);

// List/search
router.get("/", listProducts);

export default router;

