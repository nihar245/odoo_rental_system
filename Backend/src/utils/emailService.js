import nodemailer from 'nodemailer';

// Create transporter (you'll need to configure this with your email service)
const createTransporter = () => {
  // For development, you can use Gmail or other services
  // For production, use services like SendGrid, AWS SES, etc.
  return nodemailer.createTransporter({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password',
    },
  });
};

// Email templates
const emailTemplates = {
  rental_reminder: (data) => ({
    subject: `Rental Reminder: Return Due in ${data.daysLeft} Days`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Rental Return Reminder</h2>
        <p>Hello ${data.customerName},</p>
        <p>This is a friendly reminder that your rental items are due for return in <strong>${data.daysLeft} days</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Rental Details:</h3>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Return Date:</strong> ${data.returnDate}</p>
          <p><strong>Items:</strong></p>
          <ul>
            ${data.items.map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('')}
          </ul>
        </div>
        
        <p>Please ensure all items are ready for pickup on the scheduled date. If you need to extend your rental or have any questions, please contact us.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  pickup_reminder: (data) => ({
    subject: `Pickup Reminder: Items Due for Return`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Pickup Reminder</h2>
        <p>Hello ${data.customerName},</p>
        <p>This is a reminder that our pickup team will be collecting your rental items on <strong>${data.pickupDate}</strong>.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Pickup Details:</h3>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Pickup Date:</strong> ${data.pickupDate}</p>
          <p><strong>Pickup Address:</strong> ${data.pickupAddress}</p>
          <p><strong>Items to be collected:</strong></p>
          <ul>
            ${data.items.map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('')}
          </ul>
        </div>
        
        <p>Please ensure all items are ready and accessible for our pickup team. If you need to reschedule, please contact us immediately.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  delivery_reminder: (data) => ({
    subject: `Delivery Reminder: Items Arriving Soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Delivery Reminder</h2>
        <p>Hello ${data.customerName},</p>
        <p>This is a reminder that your rental items will be delivered on <strong>${data.deliveryDate}</strong>.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Delivery Details:</h3>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Delivery Date:</strong> ${data.deliveryDate}</p>
          <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
          <p><strong>Items being delivered:</strong></p>
          <ul>
            ${data.items.map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('')}
          </ul>
        </div>
        
        <p>Please ensure someone is available to receive the items at the specified address and time.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  team_pickup_assignment: (data) => ({
    subject: `Pickup Assignment: Order ${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Pickup Assignment</h2>
        <p>Hello ${data.teamMemberName},</p>
        <p>You have been assigned a pickup task for order <strong>${data.orderId}</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Pickup Details:</h3>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Customer Phone:</strong> ${data.customerPhone}</p>
          <p><strong>Pickup Date:</strong> ${data.pickupDate}</p>
          <p><strong>Pickup Address:</strong> ${data.pickupAddress}</p>
          <p><strong>Items to collect:</strong></p>
          <ul>
            ${data.items.map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('')}
          </ul>
        </div>
        
        <p>Please review the pickup document in the admin portal for complete details.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  team_delivery_assignment: (data) => ({
    subject: `Delivery Assignment: Order ${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Delivery Assignment</h2>
        <p>Hello ${data.teamMemberName},</p>
        <p>You have been assigned a delivery task for order <strong>${data.orderId}</strong>.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Delivery Details:</h3>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Customer Phone:</strong> ${data.customerPhone}</p>
          <p><strong>Delivery Date:</strong> ${data.deliveryDate}</p>
          <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
          <p><strong>Items to deliver:</strong></p>
          <ul>
            ${data.items.map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('')}
          </ul>
        </div>
        
        <p>Please review the delivery document in the admin portal for complete details.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  // New templates for rental requests
  rental_request_created: (data) => ({
    subject: `New Rental Request: ${data.product_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Rental Request</h2>
        <p>Hello Admin,</p>
        <p>A new rental request has been submitted that requires your review.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Request Details:</h3>
          <p><strong>Customer:</strong> ${data.customer_name}</p>
          <p><strong>Customer Email:</strong> ${data.customer_email}</p>
          <p><strong>Product:</strong> ${data.product_name}</p>
          <p><strong>Quantity:</strong> ${data.quantity}</p>
          <p><strong>Duration:</strong> ${data.duration_days} days</p>
          <p><strong>Total Amount:</strong> $${data.total_amount}</p>
        </div>
        
        <p>Please review this request in the admin portal and approve or reject it accordingly.</p>
        
        <p>Best regards,<br>Rental Management System</p>
      </div>
    `
  }),

  rental_request_approved: (data) => ({
    subject: `Rental Request Approved: ${data.product_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Rental Request Approved!</h2>
        <p>Hello ${data.customer_name},</p>
        <p>Congratulations! Your rental request has been approved.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Approval Details:</h3>
          <p><strong>Product:</strong> ${data.product_name}</p>
          <p><strong>Payment Amount:</strong> $${data.payment_amount}</p>
          <p><strong>Payment Due Date:</strong> ${data.payment_due_date}</p>
        </div>
        
        <p>Please complete your payment by the due date to proceed with the rental. You will receive payment reminders as the due date approaches.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  rental_request_rejected: (data) => ({
    subject: `Rental Request Rejected: ${data.product_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Rental Request Rejected</h2>
        <p>Hello ${data.customer_name},</p>
        <p>We regret to inform you that your rental request has been rejected.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Rejection Details:</h3>
          <p><strong>Product:</strong> ${data.product_name}</p>
          <p><strong>Reason:</strong> ${data.rejection_reason || 'No reason provided'}</p>
        </div>
        
        <p>If you have any questions about this decision, please contact our support team.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  payment_reminder: (data) => ({
    subject: `Payment Reminder: ${data.product_name} - Due in ${data.days_remaining} days`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Payment Reminder</h2>
        <p>Hello ${data.customer_name},</p>
        <p>This is a friendly reminder that your payment is due soon.</p>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Product:</strong> ${data.product_name}</p>
          <p><strong>Amount Due:</strong> $${data.payment_amount}</p>
          <p><strong>Due Date:</strong> ${data.payment_due_date}</p>
          <p><strong>Days Remaining:</strong> ${data.days_remaining} day${data.days_remaining > 1 ? 's' : ''}</p>
        </div>
        
        <p>Please complete your payment to avoid any delays in your rental service.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  payment_confirmed: (data) => ({
    subject: `Payment Confirmed: ${data.product_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Payment Confirmed!</h2>
        <p>Hello ${data.customer_name},</p>
        <p>Great news! Your payment has been confirmed.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Product:</strong> ${data.product_name}</p>
          <p><strong>Amount Paid:</strong> $${data.payment_amount}</p>
          <p><strong>Status:</strong> Confirmed</p>
        </div>
        
        <p>Your rental is now active and our delivery team will contact you soon to schedule the delivery of your items.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  rental_request_cancelled: (data) => ({
    subject: `Rental Request Cancelled: ${data.product_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b7280;">Rental Request Cancelled</h2>
        <p>Hello Admin,</p>
        <p>A customer has cancelled their rental request.</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Cancellation Details:</h3>
          <p><strong>Customer:</strong> ${data.customer_name}</p>
          <p><strong>Product:</strong> ${data.product_name}</p>
          <p><strong>Status:</strong> Cancelled</p>
        </div>
        
        <p>This request has been automatically marked as cancelled in the system.</p>
        
        <p>Best regards,<br>Rental Management System</p>
      </div>
    `
  }),

  invoice_created: (data) => ({
    subject: `Invoice Created: ${data.product_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Invoice Created</h2>
        <p>Hello ${data.customer_name},</p>
        <p>Your invoice has been created for the following rental:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Invoice Details:</h3>
          <p><strong>Product:</strong> ${data.product_name}</p>
          <p><strong>Total Amount:</strong> $${data.total_amount}</p>
          <p><strong>Upfront Payment:</strong> $${data.upfront_payment}</p>
          <p><strong>Remaining Balance:</strong> $${data.remaining_balance}</p>
          <p><strong>Due Date:</strong> ${data.due_date}</p>
        </div>
        
        <p>Please complete your payment to proceed with the rental. You can view the full invoice details in your account.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  late_fee_charged: (data) => ({
    subject: `Late Fee Charged: ${data.product_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Late Fee Charged</h2>
        <p>Hello ${data.customer_name},</p>
        <p>A late fee has been charged to your account due to overdue items.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Late Fee Details:</h3>
          <p><strong>Product:</strong> ${data.product_name}</p>
          <p><strong>Days Overdue:</strong> ${data.days_overdue}</p>
          <p><strong>Late Fee Amount:</strong> $${data.late_fee_amount}</p>
          <p><strong>New Total:</strong> $${data.new_total}</p>
        </div>
        
        <p>Please return the items as soon as possible to avoid additional charges. Contact us if you need assistance.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  }),

  overdue_reminder: (data) => ({
    subject: `Overdue Reminder: ${data.product_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Overdue Reminder</h2>
        <p>Hello ${data.customer_name},</p>
        <p>Your rental items are overdue and late fees are accumulating.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Overdue Details:</h3>
          <p><strong>Product:</strong> ${data.product_name}</p>
          <p><strong>Days Overdue:</strong> ${data.days_overdue}</p>
          <p><strong>Current Late Fees:</strong> $${data.current_late_fees}</p>
          <p><strong>Total Outstanding:</strong> $${data.total_outstanding}</p>
        </div>
        
        <p>Please return the items immediately to stop additional charges. Contact us to arrange pickup.</p>
        
        <p>Best regards,<br>Rental Management Team</p>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send notification email
export const sendNotificationEmail = async (userEmail, notificationType, data) => {
  return await sendEmail(userEmail, notificationType, data);
};

// Send team assignment email
export const sendTeamAssignmentEmail = async (teamMemberEmail, assignmentType, data) => {
  const template = assignmentType === 'delivery' ? 'team_delivery_assignment' : 'team_pickup_assignment';
  return await sendEmail(teamMemberEmail, template, data);
};

// Send rental request email
export const sendRentalRequestEmail = async (userEmail, requestType, data) => {
  const templateMap = {
    'created': 'rental_request_created',
    'approved': 'rental_request_approved',
    'rejected': 'rental_request_rejected',
    'cancelled': 'rental_request_cancelled',
    'payment_reminder': 'payment_reminder',
    'payment_confirmed': 'payment_confirmed'
  };
  
  const template = templateMap[requestType];
  if (!template) {
    throw new Error(`Unknown rental request type: ${requestType}`);
  }
  
  return await sendEmail(userEmail, template, data);
};

// Send invoice email
export const sendInvoiceEmail = async (userEmail, invoiceType, data) => {
  const templateMap = {
    'created': 'invoice_created',
    'late_fee': 'late_fee_charged',
    'overdue': 'overdue_reminder'
  };
  
  const template = templateMap[invoiceType];
  if (!template) {
    throw new Error(`Unknown invoice type: ${invoiceType}`);
  }
  
  return await sendEmail(userEmail, template, data);
};
