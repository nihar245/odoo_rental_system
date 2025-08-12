import mongoose, { Schema } from "mongoose";

const ReservationSchema = new Schema(
  {
    rental_request_id: {
      type: Schema.Types.ObjectId,
      ref: 'RentalRequest',
      required: true,
      unique: true
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    customer_name: {
      type: String,
      required: true
    },
    customer_email: {
      type: String,
      required: true
    },
    customer_phone: {
      type: String,
      required: true
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    product_name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    rental_period: {
      start_date: {
        type: Date,
        required: true
      },
      end_date: {
        type: Date,
        required: true
      },
      duration_value: {
        type: Number,
        required: true
      },
      duration_type: {
        type: String,
        enum: ['hour', 'day', 'week', 'month', 'year'],
        required: true
      }
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['reserved', 'picked_up', 'delivered', 'returned', 'cancelled'],
      default: 'reserved'
    },
    pickup_address: {
      type: String,
      required: true
    },
    delivery_address: {
      type: String,
      required: true
    },
    scheduled_pickup_date: {
      type: Date,
      required: true
    },
    scheduled_delivery_date: {
      type: Date,
      required: true
    },
    actual_pickup_date: {
      type: Date
    },
    actual_delivery_date: {
      type: Date
    },
    actual_return_date: {
      type: Date
    },
    pickup_team_member: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    return_team_member: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    pickup_notes: {
      type: String
    },
    delivery_notes: {
      type: String
    },
    return_notes: {
      type: String
    },
    customer_signature: {
      type: String
    },
    team_signature: {
      type: String
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for efficient querying
ReservationSchema.index({ customer_id: 1, status: 1 });
ReservationSchema.index({ product_id: 1, status: 1 });
ReservationSchema.index({ status: 1, scheduled_pickup_date: 1 });
ReservationSchema.index({ status: 1, scheduled_delivery_date: 1 });
ReservationSchema.index({ status: 1, scheduled_return_date: 1 });
ReservationSchema.index({ pickup_team_member: 1, status: 1 });
ReservationSchema.index({ return_team_member: 1, status: 1 });

export const Reservation = mongoose.model('Reservation', ReservationSchema);
