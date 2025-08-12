import mongoose, { Schema } from "mongoose";

const PickupSchema = new Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
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
    customer_phone: {
      type: String,
    },
    delivery_address: {
      type: String,
      required: true,
    },
    pickup_address: {
      type: String,
      required: true,
    },
    scheduled_delivery_date: {
      type: Date,
      required: true,
    },
    scheduled_pickup_date: {
      type: Date,
      required: true,
    },
    actual_delivery_date: {
      type: Date,
    },
    actual_pickup_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'out_for_delivery', 'delivered', 'out_for_pickup', 'picked_up', 'completed', 'cancelled'],
      default: 'pending',
    },
    assigned_team_member: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Admin/team member assigned
    },
    assigned_team_member_name: {
      type: String,
    },
    items: [{
      product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
      product_name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      daily_rate: {
        type: Number,
        required: true,
      },
    }],
    total_amount: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
    },
    delivery_notes: {
      type: String,
    },
    pickup_notes: {
      type: String,
    },
    customer_signature: {
      type: String, // Base64 encoded signature
    },
    team_signature: {
      type: String, // Base64 encoded signature
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
PickupSchema.index({ customer_id: 1, status: 1 });
PickupSchema.index({ assigned_team_member: 1, status: 1 });
PickupSchema.index({ scheduled_delivery_date: 1 });
PickupSchema.index({ scheduled_pickup_date: 1 });
PickupSchema.index({ order_id: 1 }, { unique: true });

export const Pickup = mongoose.model('Pickup', PickupSchema);
