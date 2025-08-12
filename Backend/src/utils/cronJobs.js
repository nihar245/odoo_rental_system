import cron from 'node-cron';

// Process scheduled notifications directly without HTTP call
export const processScheduledNotificationsDirect = async () => {
  try {
    const { Notification } = await import('../models/notification.models.js');
    const { sendNotificationEmail } = await import('./emailService.js');

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Find notifications that are due to be sent
    const pendingNotifications = await Notification.find({
      scheduled_for: { $lte: now, $gte: fiveMinutesAgo },
      sent_at: { $exists: false },
      email_sent: false
    }).populate('user_id', 'email name');

    console.log(`Found ${pendingNotifications.length} pending notifications`);

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

        console.log(`Notification ${notification._id} processed - Email sent: ${emailResult.success}`);
      } catch (error) {
        console.error(`Failed to process notification ${notification._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in direct notification processing:', error);
  }
};

// Start cron job with direct processing
export const startDirectNotificationCronJob = () => {
  cron.schedule('*/5 * * * *', processScheduledNotificationsDirect);
  console.log('Direct notification cron job started - running every 5 minutes');
};

// Clean up old notifications (older than 30 days)
export const startCleanupCronJob = () => {
  cron.schedule('0 2 * * *', async () => { // Run at 2 AM daily
    try {
      const { Notification } = await import('../models/notification.models.js');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        is_read: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error('Error in cleanup cron job:', error);
    }
  });

  console.log('Cleanup cron job started - running daily at 2 AM');
};

// Process rental request reminders
export const processRentalRequestReminders = async () => {
  try {
    const { RentalRequest } = await import('../models/rentalRequest.models.js');
    const { Notification } = await import('../models/notification.models.js');
    const { Settings } = await import('../models/settings.models.js');

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find rental requests that need reminders
    const activeRentals = await RentalRequest.find({
      status: 'approved',
      payment_status: 'paid',
      'rental_period.end_date': { $gte: now, $lte: tomorrow }
    }).populate('customer_id', 'email name');

    console.log(`Found ${activeRentals.length} active rentals needing reminders`);

    for (const rental of activeRentals) {
      try {
        // Get customer settings for reminder preferences
        const customerSettings = await Settings.findOne({ user_id: rental.customer_id._id });
        const reminderDays = customerSettings?.notification_preferences?.rental_reminder_days || [3, 1];

        // Calculate days until return
        const daysUntilReturn = Math.ceil((new Date(rental.rental_period.end_date) - now) / (1000 * 60 * 60 * 24));

        // Check if we should send a reminder today
        if (reminderDays.includes(daysUntilReturn)) {
          // Check if reminder already sent
          const existingReminder = await Notification.findOne({
            user_id: rental.customer_id._id,
            rental_request_id: rental._id,
            type: 'rental_reminder',
            'metadata.daysLeft': daysUntilReturn
          });

          if (!existingReminder) {
            // Create reminder notification
            await Notification.create({
              user_id: rental.customer_id._id,
              type: 'rental_reminder',
              title: `Rental Return Reminder - ${daysUntilReturn} day${daysUntilReturn > 1 ? 's' : ''} remaining`,
              message: `Your rental of ${rental.product_name} is due for return in ${daysUntilReturn} day${daysUntilReturn > 1 ? 's' : ''}. Please ensure all items are ready for pickup.`,
              rental_request_id: rental._id,
              order_id: rental._id.toString(),
              scheduled_for: now,
              metadata: {
                daysLeft: daysUntilReturn,
                returnDate: rental.rental_period.end_date,
                items: [{ name: rental.product_name, quantity: rental.quantity }],
                customerName: rental.customer_name,
                orderId: rental._id.toString()
              }
            });

            console.log(`Created rental reminder for ${rental.customer_name} - ${daysUntilReturn} days remaining`);
          }
        }
      } catch (error) {
        console.error(`Failed to process rental reminder for ${rental._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in rental request reminder processing:', error);
  }
};

// Start rental request reminder cron job
export const startRentalRequestReminderCronJob = () => {
  cron.schedule('0 9 * * *', processRentalRequestReminders); // Run daily at 9 AM
  console.log('Rental request reminder cron job started - running daily at 9 AM');
};

// Process late fees for overdue invoices
export const processLateFees = async () => {
  try {
    const { Invoice } = await import('../models/invoice.models.js');
    const { Notification } = await import('../models/notification.models.js');
    const { sendInvoiceEmail } = await import('./emailService.js');

    const now = new Date();
    const overdueInvoices = await Invoice.find({
      status: { $in: ['sent', 'overdue'] },
      due_date: { $lt: now },
      payment_status: { $ne: 'paid' }
    }).populate('customer_id', 'email name')
      .populate('product_id', 'name');

    console.log(`Found ${overdueInvoices.length} overdue invoices`);

    for (const invoice of overdueInvoices) {
      try {
        // Calculate new late fees
        const oldLateFees = invoice.late_fees;
        invoice.late_fees = invoice.calculateLateFees();
        
        if (invoice.late_fees !== oldLateFees) {
          // Update total amount and remaining balance
          invoice.total_amount = invoice.subtotal + invoice.security_deposit + invoice.late_fees;
          invoice.payment_details.remaining_balance = invoice.total_amount - invoice.payment_details.upfront_payment;
          
          // Update status to overdue if not already
          if (invoice.status !== 'overdue') {
            invoice.status = 'overdue';
            invoice.payment_status = 'overdue';
          }
          
          await invoice.save();

          // Send late fee notification
          await Notification.create({
            user_id: invoice.customer_id._id,
            type: 'late_fee_charged',
            title: `Late Fee Charged: ${invoice.product_id.name}`,
            message: `A late fee of $${invoice.late_fees - oldLateFees} has been charged to your account. Total late fees: $${invoice.late_fees}.`,
            rental_id: invoice.rental_request_id,
            order_id: invoice.rental_request_id.toString(),
            metadata: {
              invoice_id: invoice._id,
              days_overdue: Math.ceil((now - invoice.due_date) / (1000 * 60 * 60 * 24)),
              late_fee_amount: invoice.late_fees - oldLateFees,
              new_total: invoice.total_amount
            }
          });

          // Send email notification
          await sendInvoiceEmail(invoice.customer_id.email, 'late_fee', {
            customer_name: invoice.customer_id.name,
            product_name: invoice.product_id.name,
            days_overdue: Math.ceil((now - invoice.due_date) / (1000 * 60 * 60 * 24)),
            late_fee_amount: invoice.late_fees - oldLateFees,
            new_total: invoice.total_amount
          });

          console.log(`Updated late fees for invoice ${invoice._id} - New total: $${invoice.total_amount}`);
        }
      } catch (error) {
        console.error(`Failed to process late fees for invoice ${invoice._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in late fee processing:', error);
  }
};

// Start late fee cron job
export const startLateFeeCronJob = () => {
  cron.schedule('0 8 * * *', processLateFees); // Run daily at 8 AM
  console.log('Late fee cron job started - running daily at 8 AM');
};
