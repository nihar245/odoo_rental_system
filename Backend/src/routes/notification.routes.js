import { Router } from "express";
import { 
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  scheduleRentalReminders,
  schedulePickupReminders,
  scheduleDeliveryReminders,
  sendTeamAssignmentNotification,
  processScheduledNotifications,
  createTestNotification
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All notification routes require authentication
router.use(verifyJWT);

// Get user notifications
router.get("/", getUserNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.patch("/:notification_id/read", markNotificationAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", markAllNotificationsAsRead);

// Create notification (admin only)
router.post("/create", createNotification);

// Schedule reminders
router.post("/schedule-rental-reminders", scheduleRentalReminders);
router.post("/schedule-pickup-reminders", schedulePickupReminders);
router.post("/schedule-delivery-reminders", scheduleDeliveryReminders);

// Send team assignment notification
router.post("/team-assignment", sendTeamAssignmentNotification);

// Process scheduled notifications (cron job endpoint)
router.post("/process-scheduled", processScheduledNotifications);

// Test notification endpoint (for development)
router.post("/test", createTestNotification);

export default router;
