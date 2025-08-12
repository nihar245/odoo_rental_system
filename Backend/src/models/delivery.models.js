import mongoose, { Schema } from "mongoose";

const DeliverySchema = new Schema(
  {
    reservation_id: {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true
    },
    rental_request_id: {
      type: Schema.Types.ObjectId,
      ref: 'RentalRequest',
      required: true
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
    operation_type: {
      type: String,
      enum: ['pickup', 'delivery', 'return'],
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    scheduled_date: {
      type: Date,
      required: true
    },
    actual_date: {
      type: Date
    },
    team_member_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    team_member_name: {
      type: String
    },
    pickup_address: {
      type: String,
      required: true
    },
    delivery_address: {
      type: String,
      required: true
    },
    notes: {
      type: String
    },
    customer_signature: {
      type: String
    },
    team_signature: {
      type: String
    },
    photos: [{
      type: String,
      description: String
    }],
    is_urgent: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  { timestamps: true }
);

// Indexes for efficient querying
DeliverySchema.index({ reservation_id: 1, operation_type: 1 });
DeliverySchema.index({ customer_id: 1, status: 1 });
DeliverySchema.index({ team_member_id: 1, status: 1 });
DeliverySchema.index({ scheduled_date: 1, status: 1 });
DeliverySchema.index({ operation_type: 1, status: 1 });
DeliverySchema.index({ priority: 1, scheduled_date: 1 });

export const Delivery = mongoose.model('Delivery', DeliverySchema);
