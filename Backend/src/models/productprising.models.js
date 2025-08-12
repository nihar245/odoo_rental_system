import mongoose, { Schema } from "mongoose";

const ProductPricingSchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    unit_type: {
      type: String,
      enum: ['hour', 'day', 'week', 'month', 'year'],
      required: true,
    },
    price_per_unit: {
      type: Number,
      required: true,
    },
    min_duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductPricing = mongoose.model('ProductPricing', ProductPricingSchema);