import { Router } from "express";
import { addToWishlist, removeFromWishlist, getUserWishlist, checkWishlistStatus } from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All wishlist routes require authentication
router.use(verifyJWT);

// Add product to wishlist
router.post("/add", addToWishlist);

// Remove product from wishlist
router.delete("/remove/:product_id", removeFromWishlist);

// Get user's wishlist
router.get("/", getUserWishlist);

// Check if product is in wishlist
router.get("/check/:product_id", checkWishlistStatus);

export default router;
