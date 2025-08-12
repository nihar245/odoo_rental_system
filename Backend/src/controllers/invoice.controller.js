import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import  Invoice from "../models/invoice.models.js";
import { RentalRequest } from "../models/rentalRequest.models.js";
import { Reservation } from "../models/reservation.models.js";
import { Product } from "../models/products.models.js";
import { Notification } from "../models/notification.models.js";
import { generateInvoicePDF } from "../utils/pdfGenerator.js";

// Create invoice when order is confirmed
export const createInvoice = asynchandler(async (req, res) => {
  const { rental_request_id, payment_method, upfront_payment, security_deposit, notes } = req.body;

  // Validate rental request
  const rentalRequest = await RentalRequest.findById(rental_request_id)
    .populate("product_id")
    .populate("customer_id");
  
  if (!rentalRequest) {
    throw new apierror(404, "Rental request not found");
  }

  if (rentalRequest.status !== "confirmed") {
    throw new apierror(400, "Only confirmed rental requests can have invoices created");
  }

  // Get or create reservation
  let reservation = await Reservation.findOne({ rental_request_id });
  if (!reservation) {
    throw new apierror(400, "Reservation not found for this rental request");
  }

  // Calculate total amount
  const totalDays = Math.ceil(
    (new Date(rentalRequest.scheduled_delivery_date) - new Date(rentalRequest.scheduled_pickup_date)) / (1000 * 60 * 60 * 24)
  );

  let subtotal = 0;
  if (totalDays >= 365 && rentalRequest.product_id.yearlyRate) {
    subtotal = rentalRequest.product_id.yearlyRate * Math.ceil(totalDays / 365);
  } else if (totalDays >= 30 && rentalRequest.product_id.monthlyRate) {
    subtotal = rentalRequest.product_id.monthlyRate * Math.ceil(totalDays / 30);
  } else if (totalDays >= 7 && rentalRequest.product_id.weeklyRate) {
    subtotal = rentalRequest.product_id.weeklyRate * Math.ceil(totalDays / 7);
  } else {
    subtotal = rentalRequest.product_id.dailyRate * totalDays;
  }

  const totalAmount = subtotal + (security_deposit || 0);

  // Validate upfront payment
  if (upfront_payment > totalAmount) {
    throw new apierror(400, "Upfront payment cannot exceed total amount");
  }

  // Create installments if partial payment
  let installments = [];
  if (payment_method === "partial_deposit" && upfront_payment < totalAmount) {
    const remainingBalance = totalAmount - upfront_payment;
    const installmentAmount = Math.ceil(remainingBalance / 2); // Split into 2 installments
    
    installments = [
      {
        amount: installmentAmount,
        due_date: new Date(rentalRequest.scheduled_pickup_date),
        paid: false
      },
      {
        amount: remainingBalance - installmentAmount,
        due_date: new Date(rentalRequest.scheduled_delivery_date),
        paid: false
      }
    ];
  }

  // Create invoice
  const invoice = await Invoice.create({
    rental_request_id,
    reservation_id: reservation._id,
    customer_id: rentalRequest.customer_id._id,
    product_id: rentalRequest.product_id._id,
    product_name: rentalRequest.product_id.name,
    quantity: rentalRequest.quantity,
    rental_period: {
      start_date: rentalRequest.scheduled_pickup_date,
      end_date: rentalRequest.scheduled_delivery_date,
      total_days: totalDays
    },
    pricing: {
      daily_rate: rentalRequest.product_id.dailyRate,
      weekly_rate: rentalRequest.product_id.weeklyRate,
      monthly_rate: rentalRequest.product_id.monthlyRate,
      yearly_rate: rentalRequest.product_id.yearlyRate
    },
    subtotal,
    security_deposit: security_deposit || 0,
    total_amount: totalAmount,
    payment_details: {
      upfront_payment: upfront_payment || 0,
      remaining_balance: totalAmount - (upfront_payment || 0),
      payment_method,
      installments
    },
    due_date: rentalRequest.scheduled_pickup_date,
    notes,
    admin_notes: `Invoice created by ${req.user.name}`
  });

  // Update rental request with invoice reference
  rentalRequest.invoice_id = invoice._id;
  await rentalRequest.save();

  // Send notification to customer
  await Notification.create({
    user_id: rentalRequest.customer_id._id,
    type: "invoice_created",
    title: `Invoice Created: ${rentalRequest.product_id.name}`,
    message: `Your invoice for ${rentalRequest.product_id.name} has been created. Total amount: $${totalAmount}. Upfront payment: $${upfront_payment || 0}.`,
    rental_id: rentalRequest._id,
    order_id: rentalRequest._id.toString(),
    metadata: {
      invoice_id: invoice._id,
      total_amount: totalAmount,
      upfront_payment: upfront_payment || 0,
      due_date: rentalRequest.scheduled_pickup_date
    }
  });

  return res.status(201).json(
    new apiresponse(201, { invoice }, "Invoice created successfully")
  );
});

// Get invoice by ID
export const getInvoiceById = asynchandler(async (req, res) => {
  const { invoice_id } = req.params;

  const invoice = await Invoice.findById(invoice_id)
    .populate("customer_id", "name email phone")
    .populate("product_id", "name images")
    .populate("rental_request_id")
    .populate("reservation_id");

  if (!invoice) {
    throw new apierror(404, "Invoice not found");
  }

  return res.status(200).json(
    new apiresponse(200, { invoice }, "Invoice retrieved successfully")
  );
});

// Get all invoices for admin
export const getAllInvoices = asynchandler(async (req, res) => {
  const { status, payment_status, page = 1, limit = 10 } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (payment_status) query.payment_status = payment_status;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }
  };

  const invoices = await Invoice.find(query)
    .populate("customer_id", "name email")
    .populate("product_id", "name")
    .populate("rental_request_id")
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)
    .sort(options.sort);

  const total = await Invoice.countDocuments(query);

  return res.status(200).json(
    new apiresponse(200, {
      invoices,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    }, "Invoices retrieved successfully")
  );
});

// Get customer invoices
export const getCustomerInvoices = asynchandler(async (req, res) => {
  const customer_id = req.user._id;
  const { status, payment_status } = req.query;

  const query = { customer_id };
  if (status) query.status = status;
  if (payment_status) query.payment_status = payment_status;

  const invoices = await Invoice.find(query)
    .populate("product_id", "name images")
    .populate("rental_request_id")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new apiresponse(200, { invoices }, "Customer invoices retrieved successfully")
  );
});

// Process payment
export const processPayment = asynchandler(async (req, res) => {
  const { invoice_id } = req.params;
  const { amount, payment_method, notes } = req.body;

  const invoice = await Invoice.findById(invoice_id);
  if (!invoice) {
    throw new apierror(404, "Invoice not found");
  }

  if (invoice.payment_status === "paid") {
    throw new apierror(400, "Invoice is already fully paid");
  }

  // Update upfront payment
  invoice.payment_details.upfront_payment += amount;
  invoice.payment_details.remaining_balance = invoice.total_amount - invoice.payment_details.upfront_payment;

  // Update installment if applicable
  if (invoice.payment_details.installments && invoice.payment_details.installments.length > 0) {
    let remainingAmount = amount;
    for (let installment of invoice.payment_details.installments) {
      if (!installment.paid && remainingAmount > 0) {
        const paymentAmount = Math.min(remainingAmount, installment.amount);
        installment.paid = true;
        installment.paid_date = new Date();
        remainingAmount -= paymentAmount;
      }
    }
  }

  // Update payment status
  invoice.updatePaymentStatus();
  await invoice.save();

  // Send payment confirmation notification
  await Notification.create({
    user_id: invoice.customer_id,
    type: "payment_confirmed",
    title: `Payment Confirmed: ${invoice.product_name}`,
    message: `Payment of $${amount} has been received for ${invoice.product_name}. Remaining balance: $${invoice.payment_details.remaining_balance}.`,
    rental_id: invoice.rental_request_id,
    order_id: invoice.rental_request_id.toString(),
    metadata: {
      invoice_id: invoice._id,
      payment_amount: amount,
      remaining_balance: invoice.payment_details.remaining_balance
    }
  });

  return res.status(200).json(
    new apiresponse(200, { invoice }, "Payment processed successfully")
  );
});

// Update late fees for all overdue invoices
export const updateLateFees = asynchandler(async (req, res) => {
  const overdueInvoices = await Invoice.find({
    status: { $in: ["sent", "overdue"] },
    due_date: { $lt: new Date() }
  });

  let updatedCount = 0;
  for (let invoice of overdueInvoices) {
    const oldLateFees = invoice.late_fees;
    invoice.late_fees = invoice.calculateLateFees();
    
    if (invoice.late_fees !== oldLateFees) {
      invoice.total_amount = invoice.subtotal + invoice.security_deposit + invoice.late_fees;
      invoice.payment_details.remaining_balance = invoice.total_amount - invoice.payment_details.upfront_payment;
      await invoice.save();
      updatedCount++;
    }
  }

  return res.status(200).json(
    new apiresponse(200, { updatedCount }, `Late fees updated for ${updatedCount} invoices`)
  );
});

// Generate invoice document
export const generateInvoiceDocument = asynchandler(async (req, res) => {
  const { invoice_id } = req.params;

  const invoice = await Invoice.findById(invoice_id)
    .populate("customer_id", "name email phone address")
    .populate("product_id", "name images")
    .populate("rental_request_id");

  if (!invoice) {
    throw new apierror(404, "Invoice not found");
  }

  const invoiceData = {
    invoice_number: invoice.invoice_number,
    customer: {
      name: invoice.customer_id.name,
      email: invoice.customer_id.email,
      phone: invoice.customer_id.phone,
      address: invoice.customer_id.address
    },
    product: {
      name: invoice.product_id.name,
      quantity: invoice.quantity
    },
    rental_period: {
      start_date: invoice.rental_period.start_date.toLocaleDateString(),
      end_date: invoice.rental_period.end_date.toLocaleDateString(),
      total_days: invoice.rental_period.total_days
    },
    pricing: invoice.pricing,
    subtotal: invoice.subtotal,
    security_deposit: invoice.security_deposit,
    late_fees: invoice.late_fees,
    total_amount: invoice.total_amount,
    payment_status: invoice.payment_status,
    payment_details: invoice.payment_details,
    due_date: invoice.due_date.toLocaleDateString(),
    issued_date: invoice.issued_date.toLocaleDateString(),
    notes: invoice.notes
  };

  try {
    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    throw new apierror(500, "Error generating PDF invoice: " + error.message);
  }
});

// Delete invoice (admin only)
export const deleteInvoice = asynchandler(async (req, res) => {
  const { invoice_id } = req.params;

  const invoice = await Invoice.findById(invoice_id);
  if (!invoice) {
    throw new apierror(404, "Invoice not found");
  }

  if (invoice.payment_status === "paid") {
    throw new apierror(400, "Cannot delete paid invoice");
  }

  await Invoice.findByIdAndDelete(invoice_id);

  return res.status(200).json(
    new apiresponse(200, {}, "Invoice deleted successfully")
  );
});
