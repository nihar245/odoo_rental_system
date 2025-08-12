import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Notification } from "../models/notification.models.js";
import { Pickup } from "../models/pickup.models.js";
import { User } from "../models/user.models.js";
import { sendNotificationEmail, sendTeamAssignmentEmail } from "../utils/emailService.js";

// Create notification
export const createNotification = asynchandler(async (req, res) => {
  const { user_id, type, title, message, rental_id, order_id, scheduled_for, metadata } = req.body;

  const notification = await Notification.create({
    user_id,
    type,
    title,
    message,
    rental_id,
    order_id,
    scheduled_for,
    metadata,
  });

  return res.status(201).json(
    new apiresponse(201, { notification }, "Notification created successfully")
  );
});

// Get user notifications
export const getUserNotifications = asynchandler(async (req, res) => {
  const user_id = req.user._id;
  const { page = 1, limit = 20, unread_only = false } = req.query;

  const query = { user_id };
  if (unread_only === 'true') {
    query.is_read = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('rental_id', 'order_id customer_name');

  const total = await Notification.countDocuments(query);

  return res.status(200).json(
    new apiresponse(200, { 
      notifications, 
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, "Notifications fetched successfully")
  );
});

// Mark notification as read
export const markNotificationAsRead = asynchandler(async (req, res) => {
  const { notification_id } = req.params;
  const user_id = req.user._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: notification_id, user_id },
    { is_read: true },
    { new: true }
  );

  if (!notification) {
    throw new apierror(404, "Notification not found");
  }

  return res.status(200).json(
    new apiresponse(200, { notification }, "Notification marked as read")
  );
});

// Mark all notifications as read
export const markAllNotificationsAsRead = asynchandler(async (req, res) => {
  const user_id = req.user._id;

  await Notification.updateMany(
    { user_id, is_read: false },
    { is_read: true }
  );

  return res.status(200).json(
    new apiresponse(200, {}, "All notifications marked as read")
  );
});

// Get unread notification count
export const getUnreadCount = asynchandler(async (req, res) => {
  const user_id = req.user._id;

  const count = await Notification.countDocuments({ user_id, is_read: false });

  return res.status(200).json(
    new apiresponse(200, { count }, "Unread count fetched")
  );
});

// Schedule rental reminder notifications
export const scheduleRentalReminders = asynchandler(async (req, res) => {
  const { order_id, customer_id, customer_name, customer_email, return_date, items, reminder_days = [3, 1] } = req.body;

  const notifications = [];

  for (const days of reminder_days) {
    const scheduledDate = new Date(return_date);
    scheduledDate.setDate(scheduledDate.getDate() - days);

    // Only schedule if the date is in the future
    if (scheduledDate > new Date()) {
      const notification = await Notification.create({
        user_id: customer_id,
        type: 'rental_reminder',
        title: `Rental Return Reminder - ${days} day${days > 1 ? 's' : ''} remaining`,
        message: `Your rental items are due for return in ${days} day${days > 1 ? 's' : ''}. Please ensure all items are ready for pickup.`,
        order_id,
        scheduled_for: scheduledDate,
        metadata: {
          daysLeft: days,
          returnDate: return_date,
          items: items,
          customerName: customer_name,
          orderId: order_id
        }
      });

      notifications.push(notification);
    }
  }

  return res.status(201).json(
    new apiresponse(201, { notifications }, "Rental reminders scheduled successfully")
  );
});

// Schedule pickup reminder notifications
export const schedulePickupReminders = asynchandler(async (req, res) => {
  const { order_id, customer_id, customer_name, customer_email, pickup_date, pickup_address, items, reminder_days = [1] } = req.body;

  const notifications = [];

  for (const days of reminder_days) {
    const scheduledDate = new Date(pickup_date);
    scheduledDate.setDate(scheduledDate.getDate() - days);

    // Only schedule if the date is in the future
    if (scheduledDate > new Date()) {
      const notification = await Notification.create({
        user_id: customer_id,
        type: 'pickup_reminder',
        title: `Pickup Reminder - ${days} day${days > 1 ? 's' : ''} remaining`,
        message: `Our pickup team will collect your rental items in ${days} day${days > 1 ? 's' : ''}. Please ensure all items are ready.`,
        order_id,
        scheduled_for: scheduledDate,
        metadata: {
          daysLeft: days,
          pickupDate: pickup_date,
          pickupAddress: pickup_address,
          items: items,
          customerName: customer_name,
          orderId: order_id
        }
      });

      notifications.push(notification);
    }
  }

  return res.status(201).json(
    new apiresponse(201, { notifications }, "Pickup reminders scheduled successfully")
  );
});

// Schedule delivery reminder notifications
export const scheduleDeliveryReminders = asynchandler(async (req, res) => {
  const { order_id, customer_id, customer_name, customer_email, delivery_date, delivery_address, items, reminder_days = [1] } = req.body;

  const notifications = [];

  for (const days of reminder_days) {
    const scheduledDate = new Date(delivery_date);
    scheduledDate.setDate(scheduledDate.getDate() - days);

    // Only schedule if the date is in the future
    if (scheduledDate > new Date()) {
      const notification = await Notification.create({
        user_id: customer_id,
        type: 'delivery_reminder',
        title: `Delivery Reminder - ${days} day${days > 1 ? 's' : ''} remaining`,
        message: `Your rental items will be delivered in ${days} day${days > 1 ? 's' : ''}. Please ensure someone is available to receive them.`,
        order_id,
        scheduled_for: scheduledDate,
        metadata: {
          daysLeft: days,
          deliveryDate: delivery_date,
          deliveryAddress: delivery_address,
          items: items,
          customerName: customer_name,
          orderId: order_id
        }
      });

      notifications.push(notification);
    }
  }

  return res.status(201).json(
    new apiresponse(201, { notifications }, "Delivery reminders scheduled successfully")
  );
});

// Send team assignment notifications
export const sendTeamAssignmentNotification = asynchandler(async (req, res) => {
  const { pickup_id, assignment_type } = req.body;

  const pickup = await Pickup.findById(pickup_id).populate('assigned_team_member');
  if (!pickup) {
    throw new apierror(404, "Pickup not found");
  }

  if (!pickup.assigned_team_member) {
    throw new apierror(400, "No team member assigned");
  }

  const teamMember = pickup.assigned_team_member;
  const notificationData = {
    orderId: pickup.order_id,
    teamMemberName: teamMember.name,
    customerName: pickup.customer_name,
    customerPhone: pickup.customer_phone,
    items: pickup.items,
    pickupDate: assignment_type === 'pickup' ? pickup.scheduled_pickup_date : pickup.scheduled_delivery_date,
    deliveryDate: assignment_type === 'delivery' ? pickup.scheduled_delivery_date : pickup.scheduled_pickup_date,
    pickupAddress: pickup.pickup_address,
    deliveryAddress: pickup.delivery_address,
  };

  // Send email notification
  const emailResult = await sendTeamAssignmentEmail(
    teamMember.email,
    assignment_type,
    notificationData
  );

  // Create portal notification
  const notification = await Notification.create({
    user_id: teamMember._id,
    type: 'system_alert',
    title: `${assignment_type === 'pickup' ? 'Pickup' : 'Delivery'} Assignment: Order ${pickup.order_id}`,
    message: `You have been assigned a ${assignment_type} task for order ${pickup.order_id}. Please review the details in the admin portal.`,
    order_id: pickup.order_id,
    metadata: {
      pickup_id: pickup._id,
      assignment_type,
      customer_name: pickup.customer_name,
      scheduled_date: assignment_type === 'pickup' ? pickup.scheduled_pickup_date : pickup.scheduled_delivery_date
    }
  });

  return res.status(200).json(
    new apiresponse(200, { 
      notification, 
      emailSent: emailResult.success 
    }, "Team assignment notification sent successfully")
  );
});

// Process scheduled notifications (to be called by a cron job)
export const processScheduledNotifications = asynchandler(async (req, res) => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  // Find notifications that are due to be sent
  const pendingNotifications = await Notification.find({
    scheduled_for: { $lte: now, $gte: fiveMinutesAgo },
    sent_at: { $exists: false },
    email_sent: false
  }).populate('user_id', 'email name');

  const results = [];

  for (const notification of pendingNotifications) {
    try {
      // Send email notification
      const emailResult = await sendNotificationEmail(
        notification.user_id.email,
        notification.type,
        notification.metadata
      );

      // Update notification status
      await Notification.findByIdAndUpdate(notification._id, {
        sent_at: now,
        email_sent: emailResult.success,
        portal_shown: true
      });

      results.push({
        notification_id: notification._id,
        email_sent: emailResult.success,
        error: emailResult.error
      });
    } catch (error) {
      console.error(`Failed to process notification ${notification._id}:`, error);
      results.push({
        notification_id: notification._id,
        email_sent: false,
        error: error.message
      });
    }
  }

  return res.status(200).json(
    new apiresponse(200, { 
      processed: results.length,
      results 
    }, "Scheduled notifications processed")
  );
});

// Test notification endpoint (for development)
export const createTestNotification = asynchandler(async (req, res) => {
  const { type = 'system_alert', title, message } = req.body;
  const user_id = req.user._id;

  const notification = await Notification.create({
    user_id,
    type,
    title: title || 'Test Notification',
    message: message || 'This is a test notification to verify the system is working.',
    metadata: {
      test: true,
      timestamp: new Date().toISOString()
    }
  });

  return res.status(201).json(
    new apiresponse(201, { notification }, "Test notification created successfully")
  );
});
