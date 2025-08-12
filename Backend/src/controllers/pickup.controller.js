import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Pickup } from "../models/pickup.models.js";
import { Product } from "../models/products.models.js";
import { User } from "../models/user.models.js";
import { sendTeamAssignmentNotification } from "./notification.controller.js";

// Create pickup/delivery record
export const createPickup = asynchandler(async (req, res) => {
  const {
    order_id,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    pickup_address,
    scheduled_delivery_date,
    scheduled_pickup_date,
    items,
    total_amount,
    notes
  } = req.body;

  const created_by = req.user._id;

  const pickup = await Pickup.create({
    order_id,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    pickup_address,
    scheduled_delivery_date,
    scheduled_pickup_date,
    items,
    total_amount,
    notes,
    created_by
  });

  return res.status(201).json(
    new apiresponse(201, { pickup }, "Pickup record created successfully")
  );
});

// Get all pickups (admin)
export const getAllPickups = asynchandler(async (req, res) => {
  const { status, assigned_team_member, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (assigned_team_member) query.assigned_team_member = assigned_team_member;

  const pickups = await Pickup.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('customer_id', 'name email')
    .populate('assigned_team_member', 'name email');

  const total = await Pickup.countDocuments(query);

  return res.status(200).json(
    new apiresponse(200, {
      pickups,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, "Pickups fetched successfully")
  );
});

// Get user's pickups (customer)
export const getUserPickups = asynchandler(async (req, res) => {
  const customer_id = req.user._id;
  const { status, page = 1, limit = 20 } = req.query;

  const query = { customer_id };
  if (status) query.status = status;

  const pickups = await Pickup.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('assigned_team_member', 'name email');

  const total = await Pickup.countDocuments(query);

  return res.status(200).json(
    new apiresponse(200, {
      pickups,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, "User pickups fetched successfully")
  );
});

// Get pickup by ID
export const getPickupById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const pickup = await Pickup.findById(id)
    .populate('customer_id', 'name email phone_number')
    .populate('assigned_team_member', 'name email')
    .populate('created_by', 'name');

  if (!pickup) {
    throw new apierror(404, "Pickup not found");
  }

  return res.status(200).json(
    new apiresponse(200, { pickup }, "Pickup fetched successfully")
  );
});

// Assign team member to pickup
export const assignTeamMember = asynchandler(async (req, res) => {
  const { pickup_id } = req.params;
  const { team_member_id } = req.body;

  const pickup = await Pickup.findById(pickup_id);
  if (!pickup) {
    throw new apierror(404, "Pickup not found");
  }

  const teamMember = await User.findById(team_member_id);
  if (!teamMember) {
    throw new apierror(404, "Team member not found");
  }

  pickup.assigned_team_member = team_member_id;
  pickup.assigned_team_member_name = teamMember.name;
  pickup.status = 'assigned';
  await pickup.save();

  // Send notification to team member
  await sendTeamAssignmentNotification({
    body: { 
      pickup_id, 
      assignment_type: pickup.scheduled_delivery_date > pickup.scheduled_pickup_date ? 'delivery' : 'pickup' 
    }
  }, res);

  return res.status(200).json(
    new apiresponse(200, { pickup }, "Team member assigned successfully")
  );
});

// Update pickup status
export const updatePickupStatus = asynchandler(async (req, res) => {
  const { pickup_id } = req.params;
  const { status, notes, delivery_notes, pickup_notes } = req.body;

  const pickup = await Pickup.findById(pickup_id);
  if (!pickup) {
    throw new apierror(404, "Pickup not found");
  }

  const updateData = { status };
  if (notes) updateData.notes = notes;
  if (delivery_notes) updateData.delivery_notes = delivery_notes;
  if (pickup_notes) updateData.pickup_notes = pickup_notes;

  // Set actual dates based on status
  if (status === 'delivered') {
    updateData.actual_delivery_date = new Date();
  } else if (status === 'picked_up') {
    updateData.actual_pickup_date = new Date();
  }

  const updatedPickup = await Pickup.findByIdAndUpdate(
    pickup_id,
    updateData,
    { new: true }
  );

  // Update stock when items are delivered or picked up
  if (status === 'delivered' || status === 'picked_up') {
    for (const item of pickup.items) {
      const product = await Product.findById(item.product_id);
      if (product) {
        if (status === 'delivered') {
          // Reduce stock when delivered to customer
          product.quantity = Math.max(0, product.quantity - item.quantity);
        } else if (status === 'picked_up') {
          // Increase stock when picked up from customer
          product.quantity += item.quantity;
        }
        await product.save();
      }
    }
  }

  return res.status(200).json(
    new apiresponse(200, { pickup: updatedPickup }, "Pickup status updated successfully")
  );
});

// Add signatures
export const addSignature = asynchandler(async (req, res) => {
  const { pickup_id } = req.params;
  const { signature_type, signature_data } = req.body;

  const pickup = await Pickup.findById(pickup_id);
  if (!pickup) {
    throw new apierror(404, "Pickup not found");
  }

  if (signature_type === 'customer') {
    pickup.customer_signature = signature_data;
  } else if (signature_type === 'team') {
    pickup.team_signature = signature_data;
  } else {
    throw new apierror(400, "Invalid signature type");
  }

  await pickup.save();

  return res.status(200).json(
    new apiresponse(200, { pickup }, "Signature added successfully")
  );
});

// Generate pickup document (PDF data)
export const generatePickupDocument = asynchandler(async (req, res) => {
  const { pickup_id } = req.params;

  const pickup = await Pickup.findById(pickup_id)
    .populate('customer_id', 'name email phone_number')
    .populate('assigned_team_member', 'name email');

  if (!pickup) {
    throw new apierror(404, "Pickup not found");
  }

  // Generate document data (in a real app, you'd use a PDF library)
  const documentData = {
    pickup_id: pickup._id,
    order_id: pickup.order_id,
    customer: {
      name: pickup.customer_name,
      email: pickup.customer_email,
      phone: pickup.customer_phone,
    },
    delivery_address: pickup.delivery_address,
    pickup_address: pickup.pickup_address,
    scheduled_delivery_date: pickup.scheduled_delivery_date,
    scheduled_pickup_date: pickup.scheduled_pickup_date,
    items: pickup.items,
    total_amount: pickup.total_amount,
    assigned_team_member: pickup.assigned_team_member_name,
    status: pickup.status,
    notes: pickup.notes,
    created_at: pickup.createdAt,
  };

  return res.status(200).json(
    new apiresponse(200, { documentData }, "Pickup document generated successfully")
  );
});

// Get pickup statistics
export const getPickupStats = asynchandler(async (req, res) => {
  const stats = await Pickup.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total_amount: { $sum: '$total_amount' }
      }
    }
  ]);

  const totalPickups = await Pickup.countDocuments();
  const totalAmount = await Pickup.aggregate([
    { $group: { _id: null, total: { $sum: '$total_amount' } } }
  ]);

  const todayPickups = await Pickup.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999))
    }
  });

  return res.status(200).json(
    new apiresponse(200, {
      statusBreakdown: stats,
      totalPickups,
      totalAmount: totalAmount[0]?.total || 0,
      todayPickups
    }, "Pickup statistics fetched successfully")
  );
});
