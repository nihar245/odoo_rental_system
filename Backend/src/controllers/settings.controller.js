import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Settings } from "../models/settings.models.js";
import { User } from "../models/user.models.js";

// Get user settings
export const getUserSettings = asynchandler(async (req, res) => {
  const user_id = req.user._id;

  let settings = await Settings.findOne({ user_id });
  
  // Create default settings if none exist
  if (!settings) {
    settings = await Settings.create({ user_id });
  }

  return res.status(200).json(
    new apiresponse(200, { settings }, "Settings fetched successfully")
  );
});

// Update notification preferences
export const updateNotificationPreferences = asynchandler(async (req, res) => {
  const user_id = req.user._id;
  const {
    rental_reminder_days,
    payment_reminder_days,
    pickup_reminder_days,
    delivery_reminder_days,
    email_notifications,
    portal_notifications,
    push_notifications
  } = req.body;

  let settings = await Settings.findOne({ user_id });
  
  if (!settings) {
    settings = new Settings({ user_id });
  }

  // Update notification preferences
  if (rental_reminder_days !== undefined) {
    settings.notification_preferences.rental_reminder_days = rental_reminder_days;
  }
  if (payment_reminder_days !== undefined) {
    settings.notification_preferences.payment_reminder_days = payment_reminder_days;
  }
  if (pickup_reminder_days !== undefined) {
    settings.notification_preferences.pickup_reminder_days = pickup_reminder_days;
  }
  if (delivery_reminder_days !== undefined) {
    settings.notification_preferences.delivery_reminder_days = delivery_reminder_days;
  }
  if (email_notifications !== undefined) {
    settings.notification_preferences.email_notifications = email_notifications;
  }
  if (portal_notifications !== undefined) {
    settings.notification_preferences.portal_notifications = portal_notifications;
  }
  if (push_notifications !== undefined) {
    settings.notification_preferences.push_notifications = push_notifications;
  }

  await settings.save();

  return res.status(200).json(
    new apiresponse(200, { settings }, "Notification preferences updated successfully")
  );
});

// Update business settings (admin only)
export const updateBusinessSettings = asynchandler(async (req, res) => {
  const user_id = req.user._id;
  
  // Check if user is admin
  const user = await User.findById(user_id);
  if (user.role !== 'admin') {
    throw new apierror(403, "Only admins can update business settings");
  }

  const {
    auto_approve_rentals,
    require_payment_before_delivery,
    max_rental_duration_days,
    min_rental_duration_hours
  } = req.body;

  let settings = await Settings.findOne({ user_id });
  
  if (!settings) {
    settings = new Settings({ user_id });
  }

  // Update business settings
  if (auto_approve_rentals !== undefined) {
    settings.business_settings.auto_approve_rentals = auto_approve_rentals;
  }
  if (require_payment_before_delivery !== undefined) {
    settings.business_settings.require_payment_before_delivery = require_payment_before_delivery;
  }
  if (max_rental_duration_days !== undefined) {
    settings.business_settings.max_rental_duration_days = max_rental_duration_days;
  }
  if (min_rental_duration_hours !== undefined) {
    settings.business_settings.min_rental_duration_hours = min_rental_duration_hours;
  }

  await settings.save();

  return res.status(200).json(
    new apiresponse(200, { settings }, "Business settings updated successfully")
  );
});

// Get all users' settings (admin only)
export const getAllUsersSettings = asynchandler(async (req, res) => {
  const user_id = req.user._id;
  
  // Check if user is admin
  const user = await User.findById(user_id);
  if (user.role !== 'admin') {
    throw new apierror(403, "Only admins can view all users' settings");
  }

  const settings = await Settings.find()
    .populate('user_id', 'name email role')
    .sort({ updated_at: -1 });

  return res.status(200).json(
    new apiresponse(200, { settings }, "All users' settings fetched successfully")
  );
});

// Reset user settings to defaults
export const resetUserSettings = asynchandler(async (req, res) => {
  const user_id = req.user._id;

  let settings = await Settings.findOne({ user_id });
  
  if (!settings) {
    settings = new Settings({ user_id });
  }

  // Reset to default values
  settings.notification_preferences = {
    rental_reminder_days: [3, 1],
    payment_reminder_days: [7, 3, 1],
    pickup_reminder_days: [1],
    delivery_reminder_days: [1],
    email_notifications: true,
    portal_notifications: true,
    push_notifications: false,
  };

  if (settings.user_id.role === 'admin') {
    settings.business_settings = {
      auto_approve_rentals: false,
      require_payment_before_delivery: true,
      max_rental_duration_days: 365,
      min_rental_duration_hours: 1,
    };
  }

  await settings.save();

  return res.status(200).json(
    new apiresponse(200, { settings }, "Settings reset to defaults successfully")
  );
});

// Get notification statistics for user
export const getNotificationStats = asynchandler(async (req, res) => {
  const user_id = req.user._id;

  const settings = await Settings.findOne({ user_id });
  if (!settings) {
    return res.status(200).json(
      new apiresponse(200, { 
        stats: {
          total_reminders: 0,
          active_reminders: 0,
          notification_preferences: {
            rental_reminder_days: [3, 1],
            payment_reminder_days: [7, 3, 1],
            pickup_reminder_days: [1],
            delivery_reminder_days: [1],
          }
        }
      }, "Notification statistics fetched successfully")
    );
  }

  // Calculate statistics based on user preferences
  const totalReminders = 
    settings.notification_preferences.rental_reminder_days.length +
    settings.notification_preferences.payment_reminder_days.length +
    settings.notification_preferences.pickup_reminder_days.length +
    settings.notification_preferences.delivery_reminder_days.length;

  const stats = {
    total_reminders: totalReminders,
    active_reminders: totalReminders,
    notification_preferences: settings.notification_preferences,
    email_enabled: settings.notification_preferences.email_notifications,
    portal_enabled: settings.notification_preferences.portal_notifications,
    push_enabled: settings.notification_preferences.push_notifications,
  };

  return res.status(200).json(
    new apiresponse(200, { stats }, "Notification statistics fetched successfully")
  );
});
