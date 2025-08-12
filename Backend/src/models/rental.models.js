import mongoose from "mongoose";

const RentalSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'picked_up', 'returned', 'cancelled'],
      default: 'confirmed',
    },
    total_amount: {
      type: Number,
      required: true,
    },
    late_fees: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Rental = mongoose.model('Rental', RentalSchema);   