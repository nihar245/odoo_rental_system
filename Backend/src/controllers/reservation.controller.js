import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Reservation } from "../models/reservation.models.js";
import { RentalRequest } from "../models/rentalRequest.models.js";
import { Product } from "../models/products.models.js";
import { Delivery } from "../models/delivery.models.js";
import { Notification } from "../models/notification.models.js";
import { sendRentalRequestEmail } from "../utils/emailService.js";

// Create reservation when order is confirmed
const createReservation = asynchandler(async (req, res) => {
  try {
    const { rental_request_id } = req.body;

    // Get the rental request
    const rentalRequest = await RentalRequest.findById(rental_request_id)
      .populate('customer_id', 'name email phone_number')
      .populate('product_id', 'name quantity');

    if (!rentalRequest) {
      throw new apierror(404, "Rental request not found");
    }

    if (rentalRequest.status !== 'approved') {
      throw new apierror(400, "Only approved rental requests can be reserved");
    }

    // Check if product has sufficient quantity
    const product = await Product.findById(rentalRequest.product_id);
    if (!product) {
      throw new apierror(404, "Product not found");
    }

    if (product.quantity < rentalRequest.quantity) {
      throw new apierror(400, `Insufficient product quantity. Available: ${product.quantity}, Requested: ${rentalRequest.quantity}`);
    }

    // Check if reservation already exists
    const existingReservation = await Reservation.findOne({ rental_request_id });
    if (existingReservation) {
      throw new apierror(400, "Reservation already exists for this rental request");
    }

    // Create reservation
    const reservation = await Reservation.create({
      rental_request_id: rentalRequest._id,
      customer_id: rentalRequest.customer_id._id,
      customer_name: rentalRequest.customer_id.name,
      customer_email: rentalRequest.customer_id.email,
      customer_phone: rentalRequest.customer_id.phone_number,
      product_id: rentalRequest.product_id._id,
      product_name: rentalRequest.product_id.name,
      quantity: rentalRequest.quantity,
      rental_period: rentalRequest.rental_period,
      total_amount: rentalRequest.total_amount,
      pickup_address: rentalRequest.pickup_address,
      delivery_address: rentalRequest.delivery_address,
      scheduled_pickup_date: rentalRequest.scheduled_pickup_date,
      scheduled_delivery_date: rentalRequest.scheduled_delivery_date
    });

    // Update product quantity (reserve the items)
    await Product.findByIdAndUpdate(
      rentalRequest.product_id._id,
      { $inc: { quantity: -rentalRequest.quantity } }
    );

    // Update rental request status
    await RentalRequest.findByIdAndUpdate(
      rentalRequest._id,
      { status: 'confirmed' }
    );

    // Create pickup delivery record
    await Delivery.create({
      reservation_id: reservation._id,
      rental_request_id: rentalRequest._id,
      customer_id: rentalRequest.customer_id._id,
      customer_name: rentalRequest.customer_id.name,
      customer_email: rentalRequest.customer_id.email,
      customer_phone: rentalRequest.customer_id.phone_number,
      product_id: rentalRequest.product_id._id,
      product_name: rentalRequest.product_id.name,
      quantity: rentalRequest.quantity,
      operation_type: 'pickup',
      scheduled_date: rentalRequest.scheduled_pickup_date,
      pickup_address: rentalRequest.pickup_address,
      delivery_address: rentalRequest.delivery_address
    });

    // Create delivery record
    await Delivery.create({
      reservation_id: reservation._id,
      rental_request_id: rentalRequest._id,
      customer_id: rentalRequest.customer_id._id,
      customer_name: rentalRequest.customer_id.name,
      customer_email: rentalRequest.customer_id.email,
      customer_phone: rentalRequest.customer_id.phone_number,
      product_id: rentalRequest.product_id._id,
      product_name: rentalRequest.product_id.name,
      quantity: rentalRequest.quantity,
      operation_type: 'delivery',
      scheduled_date: rentalRequest.scheduled_delivery_date,
      pickup_address: rentalRequest.pickup_address,
      delivery_address: rentalRequest.delivery_address
    });

    // Create notification for customer
    await Notification.create({
      user_id: rentalRequest.customer_id._id,
      type: 'rental_request_confirmed',
      title: 'Order Confirmed - Items Reserved',
      message: `Your rental request for ${rentalRequest.product_id.name} has been confirmed and items are now reserved. Pickup scheduled for ${new Date(rentalRequest.scheduled_pickup_date).toLocaleDateString()}.`,
      rental_request_id: rentalRequest._id,
      priority: 'high'
    });

    // Send email confirmation
    await sendRentalRequestEmail(
      rentalRequest.customer_id.email,
      'confirmed',
      {
        customerName: rentalRequest.customer_id.name,
        productName: rentalRequest.product_id.name,
        pickupDate: rentalRequest.scheduled_pickup_date,
        deliveryDate: rentalRequest.scheduled_delivery_date,
        totalAmount: rentalRequest.total_amount
      }
    );

    res.status(201).json(new apiresponse(201, reservation, "Reservation created successfully. Items reserved and pickup/delivery scheduled."));
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json(new apiresponse(500, null, `Error creating reservation: ${error.message}`));
  }
});

// Get all reservations
const getAllReservations = asynchandler(async (req, res) => {
  try {
    const { status, customer_id, product_id, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (customer_id) filter.customer_id = customer_id;
    if (product_id) filter.product_id = product_id;

    const reservations = await Reservation.find(filter)
      .populate('customer_id', 'name email phone_number')
      .populate('product_id', 'name')
      .populate('pickup_team_member', 'name')
      .populate('return_team_member', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reservation.countDocuments(filter);

    res.status(200).json(new apiresponse(200, {
      reservations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, "Reservations retrieved successfully"));
  } catch (error) {
    console.error('Error getting reservations:', error);
    res.status(500).json(new apiresponse(500, null, `Error getting reservations: ${error.message}`));
  }
});

// Get reservation by ID
const getReservationById = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await Reservation.findById(id)
      .populate('customer_id', 'name email phone_number')
      .populate('product_id', 'name')
      .populate('pickup_team_member', 'name')
      .populate('return_team_member', 'name');

    if (!reservation) {
      throw new apierror(404, "Reservation not found");
    }

    res.status(200).json(new apiresponse(200, reservation, "Reservation retrieved successfully"));
  } catch (error) {
    console.error('Error getting reservation:', error);
    res.status(500).json(new apiresponse(500, null, `Error getting reservation: ${error.message}`));
  }
});

// Update reservation status
const updateReservationStatus = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, team_member_id } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      throw new apierror(404, "Reservation not found");
    }

    const oldStatus = reservation.status;
    reservation.status = status;

    // Handle status-specific logic
    switch (status) {
      case 'picked_up':
        reservation.actual_pickup_date = new Date();
        reservation.pickup_team_member = team_member_id;
        reservation.pickup_notes = notes;
        break;
      
      case 'delivered':
        reservation.actual_delivery_date = new Date();
        reservation.pickup_team_member = team_member_id;
        reservation.delivery_notes = notes;
        break;
      
      case 'returned':
        reservation.actual_return_date = new Date();
        reservation.return_team_member = team_member_id;
        reservation.return_notes = notes;
        
        // Update product quantity (items are back in stock)
        await Product.findByIdAndUpdate(
          reservation.product_id,
          { $inc: { quantity: reservation.quantity } }
        );
        
        // Update rental request status
        await RentalRequest.findByIdAndUpdate(
          reservation.rental_request_id,
          { status: 'completed' }
        );
        break;
    }

    await reservation.save();

    // Create notification for customer
    let notificationTitle, notificationMessage;
    switch (status) {
      case 'picked_up':
        notificationTitle = 'Items Picked Up';
        notificationMessage = `Your items for ${reservation.product_name} have been picked up and are on their way to you.`;
        break;
      case 'delivered':
        notificationTitle = 'Items Delivered';
        notificationMessage = `Your items for ${reservation.product_name} have been delivered to your address. Enjoy your rental!`;
        break;
      case 'returned':
        notificationTitle = 'Items Returned';
        notificationMessage = `Your items for ${reservation.product_name} have been successfully returned. Thank you for using our service!`;
        break;
    }

    if (notificationTitle) {
      await Notification.create({
        user_id: reservation.customer_id,
        type: 'rental_status_update',
        title: notificationTitle,
        message: notificationMessage,
        rental_request_id: reservation.rental_request_id,
        priority: 'medium'
      });
    }

    res.status(200).json(new apiresponse(200, reservation, `Reservation status updated to ${status}`));
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json(new apiresponse(500, null, `Error updating reservation status: ${error.message}`));
  }
});

// Generate pickup document
const generatePickupDocument = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await Reservation.findById(id)
      .populate('customer_id', 'name email phone_number')
      .populate('product_id', 'name')
      .populate('pickup_team_member', 'name');

    if (!reservation) {
      throw new apierror(404, "Reservation not found");
    }

    const pickupDocument = {
      document_type: 'Pickup Document',
      reservation_id: reservation._id,
      customer_details: {
        name: reservation.customer_name,
        email: reservation.customer_email,
        phone: reservation.customer_phone
      },
      product_details: {
        name: reservation.product_name,
        quantity: reservation.quantity
      },
      pickup_details: {
        address: reservation.pickup_address,
        scheduled_date: reservation.scheduled_pickup_date,
        team_member: reservation.pickup_team_member?.name || 'Unassigned'
      },
      rental_period: reservation.rental_period,
      total_amount: reservation.total_amount,
      generated_at: new Date(),
      instructions: [
        'Verify product condition before pickup',
        'Collect customer signature upon pickup',
        'Take photos if needed',
        'Update status in system after pickup'
      ]
    };

    res.status(200).json(new apiresponse(200, pickupDocument, "Pickup document generated successfully"));
  } catch (error) {
    console.error('Error generating pickup document:', error);
    res.status(500).json(new apiresponse(500, null, `Error generating pickup document: ${error.message}`));
  }
});

// Generate return document
const generateReturnDocument = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await Reservation.findById(id)
      .populate('customer_id', 'name email phone_number')
      .populate('product_id', 'name')
      .populate('return_team_member', 'name');

    if (!reservation) {
      throw new apierror(404, "Reservation not found");
    }

    const returnDocument = {
      document_type: 'Return Document',
      reservation_id: reservation._id,
      customer_details: {
        name: reservation.customer_name,
        email: reservation.customer_email,
        phone: reservation.customer_phone
      },
      product_details: {
        name: reservation.product_name,
        quantity: reservation.quantity
      },
      return_details: {
        address: reservation.delivery_address,
        scheduled_date: reservation.rental_period.end_date,
        team_member: reservation.return_team_member?.name || 'Unassigned'
      },
      rental_period: reservation.rental_period,
      total_amount: reservation.total_amount,
      generated_at: new Date(),
      instructions: [
        'Verify product condition upon return',
        'Check for any damages or missing items',
        'Collect customer signature upon return',
        'Take photos if needed',
        'Update status in system after return',
        'Return items to inventory'
      ]
    };

    res.status(200).json(new apiresponse(200, returnDocument, "Return document generated successfully"));
  } catch (error) {
    console.error('Error generating return document:', error);
    res.status(500).json(new apiresponse(500, null, `Error generating return document: ${error.message}`));
  }
});

// Get customer reservations
const getCustomerReservations = asynchandler(async (req, res) => {
  try {
    const { customer_id } = req.params;
    
    const reservations = await Reservation.find({ customer_id })
      .populate('product_id', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(new apiresponse(200, reservations, "Customer reservations retrieved successfully"));
  } catch (error) {
    console.error('Error getting customer reservations:', error);
    res.status(500).json(new apiresponse(500, null, `Error getting customer reservations: ${error.message}`));
  }
});

// Cancel reservation
const cancelReservation = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      throw new apierror(404, "Reservation not found");
    }

    if (reservation.status !== 'reserved') {
      throw new apierror(400, "Only reserved items can be cancelled");
    }

    // Update product quantity (return items to stock)
    await Product.findByIdAndUpdate(
      reservation.product_id,
      { $inc: { quantity: reservation.quantity } }
    );

    // Update reservation status
    reservation.status = 'cancelled';
    reservation.is_active = false;
    await reservation.save();

    // Update rental request status
    await RentalRequest.findByIdAndUpdate(
      reservation.rental_request_id,
      { status: 'cancelled' }
    );

    // Create notification for customer
    await Notification.create({
      user_id: reservation.customer_id,
      type: 'rental_request_cancelled',
      title: 'Reservation Cancelled',
      message: `Your reservation for ${reservation.product_name} has been cancelled. Reason: ${reason || 'No reason provided'}`,
      rental_request_id: reservation.rental_request_id,
      priority: 'high'
    });

    res.status(200).json(new apiresponse(200, reservation, "Reservation cancelled successfully"));
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json(new apiresponse(500, null, `Error cancelling reservation: ${error.message}`));
  }
});

export {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  generatePickupDocument,
  generateReturnDocument,
  getCustomerReservations,
  cancelReservation
};
