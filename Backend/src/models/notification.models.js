import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'rental_reminder', 
        'pickup_reminder', 
        'delivery_reminder', 
        'return_reminder', 
        'system_alert',
        'rental_request_created',
        'rental_request_approved',
        'rental_request_rejected',
        'payment_reminder',
        'payment_confirmed',
        'rental_request_cancelled',
        'invoice_created',
        'late_fee_charged',
        'overdue_reminder',
        'rental_status_update'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    rental_id: {
      type: Schema.Types.ObjectId,
      ref: 'Rental',
    },
    rental_request_id: {
      type: Schema.Types.ObjectId,
      ref: 'RentalRequest',
    },
    order_id: {
      type: String, // For local storage orders
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    scheduled_for: {
      type: Date, // When the notification should be sent
    },
    sent_at: {
      type: Date, // When the notification was actually sent
    },
    email_sent: {
      type: Boolean,
      default: false,
    },
    portal_shown: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    action_required: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed, // Additional data like pickup details, etc.
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
NotificationSchema.index({ user_id: 1, is_read: 1 });
NotificationSchema.index({ scheduled_for: 1, sent_at: 1 });
NotificationSchema.index({ type: 1, rental_id: 1 });
NotificationSchema.index({ type: 1, rental_request_id: 1 });
NotificationSchema.index({ priority: 1, created_at: -1 });
NotificationSchema.index({ action_required: 1, is_read: 1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
