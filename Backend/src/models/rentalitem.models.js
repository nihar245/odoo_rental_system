import mongoose, { Schema } from "mongoose";

const RentalItemSchema = new Schema(
  {
    rental_id: {
      type: Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);


export const RentalItem = mongoose.model('RentalItem', RentalItemSchema);