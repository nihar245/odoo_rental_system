import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { RentalRequest } from "../models/rentalRequest.models.js";
import { Product } from "../models/products.models.js";
import { User } from "../models/user.models.js";
import { Settings } from "../models/settings.models.js";
import { Notification } from "../models/notification.models.js";
import { sendNotificationEmail } from "../utils/emailService.js";

// Create rental request
export const createRentalRequest = asynchandler(async (req, res) => {
  const {
    product_id,
    quantity,
    rental_period,
    pickup_address,
    delivery_address,
    customer_notes
  } = req.body;

  const customer_id = req.user._id;
  const customer_name = req.user.name;
  const customer_email = req.user.email;

  // Validate product exists and has sufficient stock
  const product = await Product.findById(product_id);
  if (!product) {
    throw new apierror(404, "Product not found");
  }

  if (product.quantity < quantity) {
    throw new apierror(400, "Insufficient stock available");
  }

  // Calculate total amount based on duration and pricing
  const durationInDays = Math.ceil((new Date(rental_period.end_date) - new Date(rental_period.start_date)) / (1000 * 60 * 60 * 24));
  const total_amount = product.dailyRate * durationInDays * quantity;

  // Calculate payment due date (7 days from now)
  const payment_due_date = new Date();
  payment_due_date.setDate(payment_due_date.getDate() + 7);

  const rentalRequest = await RentalRequest.create({
    customer_id,
    customer_name,
    customer_email,
    product_id,
    product_name: product.name,
    quantity,
    rental_period,
    total_amount,
    pickup_address,
    delivery_address,
    customer_notes,
    payment_amount: total_amount,
    payment_due_date
  });

  // Send notification to admin about new rental request
  const adminUsers = await User.find({ role: 'admin' });
  
  for (const admin of adminUsers) {
    await Notification.create({
      user_id: admin._id,
      type: 'system_alert',
      title: `New Rental Request: ${product.name}`,
      message: `${customer_name} has requested to rent ${quantity} ${product.name} for ${durationInDays} days. Total amount: $${total_amount}`,
      rental_id: rentalRequest._id,
      order_id: rentalRequest._id.toString(),
      metadata: {
        request_id: rentalRequest._id,
        customer_name,
        customer_email,
        product_name: product.name,
        quantity,
        total_amount,
        duration_days: durationInDays
      }
    });
  }

  // Send confirmation notification to customer
  await Notification.create({
    user_id: customer_id,
    type: 'system_alert',
    title: `Rental Request Submitted: ${product.name}`,
    message: `Your rental request for ${product.name} has been submitted and is pending admin approval. You will be notified once it's reviewed.`,
    rental_id: rentalRequest._id,
    order_id: rentalRequest._id.toString(),
    metadata: {
      request_id: rentalRequest._id,
      product_name: product.name,
      quantity,
      total_amount,
      status: 'pending'
    }
  });

  return res.status(201).json(
    new apiresponse(201, { rentalRequest }, "Rental request created successfully")
  );
});

// Get all rental requests (admin)
export const getAllRentalRequests = asynchandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const requests = await RentalRequest.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('customer_id', 'name email phone_number')
    .populate('product_id', 'name image_url dailyRate');

  const total = await RentalRequest.countDocuments(query);

  return res.status(200).json(
    new apiresponse(200, {
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, "Rental requests fetched successfully")
  );
});

// Get user's rental requests (customer)
export const getUserRentalRequests = asynchandler(async (req, res) => {
  const customer_id = req.user._id;
  const { status, page = 1, limit = 20 } = req.query;

  const query = { customer_id };
  if (status) query.status = status;

  const requests = await RentalRequest.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('product_id', 'name image_url dailyRate');

  const total = await RentalRequest.countDocuments(query);

  return res.status(200).json(
    new apiresponse(200, {
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, "User rental requests fetched successfully")
  );
});

// Approve rental request (admin)
export const approveRentalRequest = asynchandler(async (req, res) => {
  const { request_id } = req.params;
  const { admin_notes, scheduled_pickup_date, scheduled_delivery_date } = req.body;

  const rentalRequest = await RentalRequest.findById(request_id);
  if (!rentalRequest) {
    throw new apierror(404, "Rental request not found");
  }

  if (rentalRequest.status !== 'pending') {
    throw new apierror(400, "Request is not in pending status");
  }

  // Update request status
  rentalRequest.status = 'approved';
  rentalRequest.admin_notes = admin_notes;
  rentalRequest.approved_by = req.user._id;
  rentalRequest.approved_at = new Date();
  rentalRequest.scheduled_pickup_date = scheduled_pickup_date;
  rentalRequest.scheduled_delivery_date = scheduled_delivery_date;

  await rentalRequest.save();

  // Send approval notification to customer
  await Notification.create({
    user_id: rentalRequest.customer_id,
    type: 'system_alert',
    title: `Rental Request Approved: ${rentalRequest.product_name}`,
    message: `Congratulations! Your rental request for ${rentalRequest.product_name} has been approved. Please complete the payment of $${rentalRequest.payment_amount} by ${rentalRequest.payment_due_date.toDateString()}.`,
    rental_id: rentalRequest._id,
    order_id: rentalRequest._id.toString(),
    metadata: {
      request_id: rentalRequest._id,
      product_name: rentalRequest.product_name,
      payment_amount: rentalRequest.payment_amount,
      payment_due_date: rentalRequest.payment_due_date,
      status: 'approved'
    }
  });

  // Schedule payment reminders based on user settings
  const customerSettings = await Settings.findOne({ user_id: rentalRequest.customer_id });
  const reminderDays = customerSettings?.notification_preferences?.payment_reminder_days || [7, 3, 1];

  for (const days of reminderDays) {
    const reminderDate = new Date(rentalRequest.payment_due_date);
    reminderDate.setDate(reminderDate.getDate() - days);

    if (reminderDate > new Date()) {
      await Notification.create({
        user_id: rentalRequest.customer_id,
        type: 'payment_reminder',
        title: `Payment Reminder: ${rentalRequest.product_name}`,
        message: `Payment of $${rentalRequest.payment_amount} for ${rentalRequest.product_name} is due in ${days} day${days > 1 ? 's' : ''}. Please complete your payment to proceed with the rental.`,
        rental_id: rentalRequest._id,
        order_id: rentalRequest._id.toString(),
        scheduled_for: reminderDate,
        metadata: {
          request_id: rentalRequest._id,
          product_name: rentalRequest.product_name,
          payment_amount: rentalRequest.payment_amount,
          payment_due_date: rentalRequest.payment_due_date,
          days_remaining: days
        }
      });
    }
  }

  return res.status(200).json(
    new apiresponse(200, { rentalRequest }, "Rental request approved successfully")
  );
});

// Reject rental request (admin)
export const rejectRentalRequest = asynchandler(async (req, res) => {
  const { request_id } = req.params;
  const { admin_notes } = req.body;

  const rentalRequest = await RentalRequest.findById(request_id);
  if (!rentalRequest) {
    throw new apierror(404, "Rental request not found");
  }

  if (rentalRequest.status !== 'pending') {
    throw new apierror(400, "Request is not in pending status");
  }

  // Update request status
  rentalRequest.status = 'rejected';
  rentalRequest.admin_notes = admin_notes;
  rentalRequest.rejected_at = new Date();

  await rentalRequest.save();

  // Send rejection notification to customer
  await Notification.create({
    user_id: rentalRequest.customer_id,
    type: 'system_alert',
    title: `Rental Request Rejected: ${rentalRequest.product_name}`,
    message: `Your rental request for ${rentalRequest.product_name} has been rejected. Reason: ${admin_notes || 'No reason provided'}. Please contact support if you have any questions.`,
    rental_id: rentalRequest._id,
    order_id: rentalRequest._id.toString(),
    metadata: {
      request_id: rentalRequest._id,
      product_name: rentalRequest.product_name,
      rejection_reason: admin_notes,
      status: 'rejected'
    }
  });

  return res.status(200).json(
    new apiresponse(200, { rentalRequest }, "Rental request rejected successfully")
  );
});

// Update payment status
export const updatePaymentStatus = asynchandler(async (req, res) => {
  const { request_id } = req.params;
  const { payment_status } = req.body;

  const rentalRequest = await RentalRequest.findById(request_id);
  if (!rentalRequest) {
    throw new apierror(404, "Rental request not found");
  }

  rentalRequest.payment_status = payment_status;
  await rentalRequest.save();

  // Send payment confirmation notification to customer
  if (payment_status === 'paid') {
    await Notification.create({
      user_id: rentalRequest.customer_id,
      type: 'system_alert',
      title: `Payment Confirmed: ${rentalRequest.product_name}`,
      message: `Payment of $${rentalRequest.payment_amount} for ${rentalRequest.product_name} has been confirmed. Your rental is now active and delivery will be scheduled soon.`,
      rental_id: rentalRequest._id,
      order_id: rentalRequest._id.toString(),
      metadata: {
        request_id: rentalRequest._id,
        product_name: rentalRequest.product_name,
        payment_amount: rentalRequest.payment_amount,
        status: 'payment_confirmed'
      }
    });
  }

  return res.status(200).json(
    new apiresponse(200, { rentalRequest }, "Payment status updated successfully")
  );
});

// Confirm order and create reservation (admin)
export const confirmOrder = asynchandler(async (req, res) => {
  const { request_id } = req.params;
  const { admin_notes } = req.body;

  const rentalRequest = await RentalRequest.findById(request_id);
  if (!rentalRequest) {
    throw new apierror(404, "Rental request not found");
  }

  if (rentalRequest.status !== 'approved') {
    throw new apierror(400, "Only approved rental requests can be confirmed");
  }

  if (rentalRequest.payment_status !== 'paid') {
    throw new apierror(400, "Payment must be completed before confirming order");
  }

  // Update request status to confirmed
  rentalRequest.status = 'confirmed';
  rentalRequest.admin_notes = admin_notes || rentalRequest.admin_notes;
  rentalRequest.confirmed_by = req.user._id;
  rentalRequest.confirmed_at = new Date();

  await rentalRequest.save();

  // Create reservation (this will be handled by the reservation controller)
  // The reservation controller will handle product quantity updates and delivery scheduling

  // Send confirmation notification to customer
  await Notification.create({
    user_id: rentalRequest.customer_id,
    type: 'rental_request_confirmed',
    title: `Order Confirmed: ${rentalRequest.product_name}`,
    message: `Your order for ${rentalRequest.product_name} has been confirmed! Items are now reserved and pickup/delivery has been scheduled.`,
    rental_id: rentalRequest._id,
    order_id: rentalRequest._id.toString(),
    metadata: {
      request_id: rentalRequest._id,
      product_name: rentalRequest.product_name,
      status: 'confirmed',
      pickup_date: rentalRequest.scheduled_pickup_date,
      delivery_date: rentalRequest.scheduled_delivery_date
    }
  });

  return res.status(200).json(
    new apiresponse(200, { 
      rentalRequest,
      message: "Order confirmed successfully. Use the reservation API to create the actual reservation."
    }, "Order confirmed successfully")
  );
});

// Get rental request by ID
export const getRentalRequestById = asynchandler(async (req, res) => {
  const { request_id } = req.params;

  const rentalRequest = await RentalRequest.findById(request_id)
    .populate('customer_id', 'name email phone_number')
    .populate('product_id', 'name image_url dailyRate hourlyRate weeklyRate monthlyRate yearlyRate')
    .populate('approved_by', 'name');

  if (!rentalRequest) {
    throw new apierror(404, "Rental request not found");
  }

  return res.status(200).json(
    new apiresponse(200, { rentalRequest }, "Rental request fetched successfully")
  );
});

// Cancel rental request (customer)
export const cancelRentalRequest = asynchandler(async (req, res) => {
  const { request_id } = req.params;
  const { customer_notes } = req.body;

  const rentalRequest = await RentalRequest.findById(request_id);
  if (!rentalRequest) {
    throw new apierror(404, "Rental request not found");
  }

  if (rentalRequest.customer_id.toString() !== req.user._id.toString()) {
    throw new apierror(403, "You can only cancel your own requests");
  }

  if (rentalRequest.status !== 'pending') {
    throw new apierror(400, "Only pending requests can be cancelled");
  }

  rentalRequest.status = 'cancelled';
  rentalRequest.customer_notes = customer_notes;
  await rentalRequest.save();

  // Send cancellation notification to admin
  const adminUsers = await User.find({ role: 'admin' });
  
  for (const admin of adminUsers) {
    await Notification.create({
      user_id: admin._id,
      type: 'system_alert',
      title: `Rental Request Cancelled: ${rentalRequest.product_name}`,
      message: `${rentalRequest.customer_name} has cancelled their rental request for ${rentalRequest.product_name}.`,
      rental_id: rentalRequest._id,
      order_id: rentalRequest._id.toString(),
      metadata: {
        request_id: rentalRequest._id,
        customer_name: rentalRequest.customer_name,
        product_name: rentalRequest.product_name,
        status: 'cancelled'
      }
    });
  }

  return res.status(200).json(
    new apiresponse(200, { rentalRequest }, "Rental request cancelled successfully")
  );
});
