import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notification_preferences: {
      rental_reminder_days: {
        type: [Number],
        default: [3, 1], // Default: 3 days and 1 day before
        validate: {
          validator: function(v) {
            return v.every(day => day >= 0 && day <= 30);
          },
          message: 'Reminder days must be between 0 and 30'
        }
      },
      payment_reminder_days: {
        type: [Number],
        default: [7, 3, 1], // Default: 7, 3, and 1 day before
        validate: {
          validator: function(v) {
            return v.every(day => day >= 0 && day <= 30);
          },
          message: 'Payment reminder days must be between 0 and 30'
        }
      },
      pickup_reminder_days: {
        type: [Number],
        default: [1], // Default: 1 day before
        validate: {
          validator: function(v) {
            return v.every(day => day >= 0 && day <= 7);
          },
          message: 'Pickup reminder days must be between 0 and 7'
        }
      },
      delivery_reminder_days: {
        type: [Number],
        default: [1], // Default: 1 day before
        validate: {
          validator: function(v) {
            return v.every(day => day >= 0 && day <= 7);
          },
          message: 'Delivery reminder days must be between 0 and 7'
        }
      },
      email_notifications: {
        type: Boolean,
        default: true,
      },
      portal_notifications: {
        type: Boolean,
        default: true,
      },
      push_notifications: {
        type: Boolean,
        default: false,
      },
    },
    business_settings: {
      auto_approve_rentals: {
        type: Boolean,
        default: false,
      },
      require_payment_before_delivery: {
        type: Boolean,
        default: true,
      },
      max_rental_duration_days: {
        type: Number,
        default: 365,
        min: 1,
        max: 1095, // 3 years
      },
      min_rental_duration_hours: {
        type: Number,
        default: 1,
        min: 1,
        max: 24,
      },
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updated_at field before saving
SettingsSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const Settings = mongoose.model('Settings', SettingsSchema);
