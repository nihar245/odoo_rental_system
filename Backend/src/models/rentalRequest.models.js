import mongoose, { Schema } from "mongoose";

const RentalRequestSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    customer_email: {
      type: String,
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    product_name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    rental_period: {
      start_date: {
        type: Date,
        required: true,
      },
      end_date: {
        type: Date,
        required: true,
      },
      duration_type: {
        type: String,
        enum: ['hour', 'day', 'week', 'month', 'year'],
        required: true,
      },
      duration_value: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    admin_notes: {
      type: String,
    },
    customer_notes: {
      type: String,
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approved_at: {
      type: Date,
    },
    rejected_at: {
      type: Date,
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    payment_amount: {
      type: Number,
      required: true,
    },
    payment_due_date: {
      type: Date,
      required: true,
    },
    pickup_address: {
      type: String,
      required: true,
    },
    delivery_address: {
      type: String,
      required: true,
    },
    scheduled_pickup_date: {
      type: Date,
    },
    scheduled_delivery_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
RentalRequestSchema.index({ customer_id: 1, status: 1 });
RentalRequestSchema.index({ status: 1, created_at: -1 });
RentalRequestSchema.index({ product_id: 1, status: 1 });
RentalRequestSchema.index({ payment_due_date: 1, payment_status: 1 });

export const RentalRequest = mongoose.model('RentalRequest', RentalRequestSchema);
