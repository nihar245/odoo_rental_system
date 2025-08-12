import mongoose, { Schema } from "mongoose";

const WishlistSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique user-product combinations
WishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export const Wishlist = mongoose.model('Wishlist', WishlistSchema);
