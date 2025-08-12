import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Delivery } from "../models/delivery.models.js";
import { Reservation } from "../models/reservation.models.js";
import { Notification } from "../models/notification.models.js";

// Get all deliveries
const getAllDeliveries = asynchandler(async (req, res) => {
  try {
    const { operation_type, status, team_member_id, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (operation_type) filter.operation_type = operation_type;
    if (status) filter.status = status;
    if (team_member_id) filter.team_member_id = team_member_id;

    const deliveries = await Delivery.find(filter)
      .populate('reservation_id', 'status')
      .populate('customer_id', 'name email phone_number')
      .populate('product_id', 'name')
      .populate('team_member_id', 'name')
      .sort({ scheduled_date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Delivery.countDocuments(filter);

    res.status(200).json(new apiresponse(200, {
      deliveries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, "Deliveries retrieved successfully"));
  } catch (error) {
    console.error('Error getting deliveries:', error);
    res.status(500).json(new apiresponse(500, null, `Error getting deliveries: ${error.message}`));
  }
});

// Get delivery by ID
const getDeliveryById = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const delivery = await Delivery.findById(id)
      .populate('reservation_id', 'status')
      .populate('customer_id', 'name email phone_number')
      .populate('product_id', 'name')
      .populate('team_member_id', 'name');

    if (!delivery) {
      throw new apierror(404, "Delivery not found");
    }

    res.status(200).json(new apiresponse(200, delivery, "Delivery retrieved successfully"));
  } catch (error) {
    console.error('Error getting delivery:', error);
    res.status(500).json(new apiresponse(500, null, `Error getting delivery: ${error.message}`));
  }
});

// Assign team member to delivery
const assignTeamMember = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { team_member_id, team_member_name } = req.body;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      throw new apierror(404, "Delivery not found");
    }

    delivery.team_member_id = team_member_id;
    delivery.team_member_name = team_member_name;
    await delivery.save();

    // Create notification for team member
    await Notification.create({
      user_id: team_member_id,
      type: 'delivery_assigned',
      title: 'New Delivery Assignment',
      message: `You have been assigned to ${delivery.operation_type} operation for ${delivery.product_name}. Scheduled for ${new Date(delivery.scheduled_date).toLocaleDateString()}.`,
      priority: 'high'
    });

    res.status(200).json(new apiresponse(200, delivery, "Team member assigned successfully"));
  } catch (error) {
    console.error('Error assigning team member:', error);
    res.status(500).json(new apiresponse(500, null, `Error assigning team member: ${error.message}`));
  }
});

// Update delivery status
const updateDeliveryStatus = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, photos, customer_signature, team_signature } = req.body;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      throw new apierror(404, "Delivery not found");
    }

    const oldStatus = delivery.status;
    delivery.status = status;

    // Handle status-specific logic
    switch (status) {
      case 'in_progress':
        delivery.notes = notes;
        break;
      
      case 'completed':
        delivery.actual_date = new Date();
        delivery.notes = notes;
        delivery.photos = photos || [];
        delivery.customer_signature = customer_signature;
        delivery.team_signature = team_signature;
        
        // Update reservation status based on operation type
        if (delivery.operation_type === 'pickup') {
          await Reservation.findByIdAndUpdate(
            delivery.reservation_id,
            { 
              status: 'picked_up',
              actual_pickup_date: new Date(),
              pickup_team_member: delivery.team_member_id,
              pickup_notes: notes
            }
          );
        } else if (delivery.operation_type === 'delivery') {
          await Reservation.findByIdAndUpdate(
            delivery.reservation_id,
            { 
              status: 'delivered',
              actual_delivery_date: new Date(),
              pickup_team_member: delivery.team_member_id,
              delivery_notes: notes
            }
          );
        } else if (delivery.operation_type === 'return') {
          await Reservation.findByIdAndUpdate(
            delivery.reservation_id,
            { 
              status: 'returned',
              actual_return_date: new Date(),
              return_team_member: delivery.team_member_id,
              return_notes: notes
            }
          );
        }
        break;
      
      case 'cancelled':
        delivery.notes = notes;
        break;
    }

    await delivery.save();

    // Create notification for customer
    let notificationTitle, notificationMessage;
    switch (delivery.operation_type) {
      case 'pickup':
        if (status === 'completed') {
          notificationTitle = 'Items Picked Up';
          notificationMessage = `Your items for ${delivery.product_name} have been picked up and are on their way to you.`;
        }
        break;
      case 'delivery':
        if (status === 'completed') {
          notificationTitle = 'Items Delivered';
          notificationMessage = `Your items for ${delivery.product_name} have been delivered to your address. Enjoy your rental!`;
        }
        break;
      case 'return':
        if (status === 'completed') {
          notificationTitle = 'Items Returned';
          notificationMessage = `Your items for ${delivery.product_name} have been successfully returned. Thank you for using our service!`;
        }
        break;
    }

    if (notificationTitle) {
      await Notification.create({
        user_id: delivery.customer_id,
        type: 'delivery_status_update',
        title: notificationTitle,
        message: notificationMessage,
        priority: 'medium'
      });
    }

    res.status(200).json(new apiresponse(200, delivery, `Delivery status updated to ${status}`));
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json(new apiresponse(500, null, `Error updating delivery status: ${error.message}`));
  }
});

// Get deliveries by team member
const getDeliveriesByTeamMember = asynchandler(async (req, res) => {
  try {
    const { team_member_id } = req.params;
    const { status, operation_type } = req.query;
    
    const filter = { team_member_id };
    if (status) filter.status = status;
    if (operation_type) filter.operation_type = operation_type;

    const deliveries = await Delivery.find(filter)
      .populate('reservation_id', 'status')
      .populate('customer_id', 'name email phone_number')
      .populate('product_id', 'name')
      .sort({ scheduled_date: 1 });

    res.status(200).json(new apiresponse(200, deliveries, "Team member deliveries retrieved successfully"));
  } catch (error) {
    console.error('Error getting team member deliveries:', error);
    res.status(500).json(new apiresponse(500, null, `Error getting team member deliveries: ${error.message}`));
  }
});

// Get urgent deliveries
const getUrgentDeliveries = asynchandler(async (req, res) => {
  try {
    const urgentDeliveries = await Delivery.find({
      $or: [
        { is_urgent: true },
        { priority: 'urgent' },
        { 
          scheduled_date: { 
            $gte: new Date(), 
            $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
          } 
        }
      ],
      status: { $in: ['scheduled', 'in_progress'] }
    })
    .populate('reservation_id', 'status')
    .populate('customer_id', 'name email phone_number')
    .populate('product_id', 'name')
    .populate('team_member_id', 'name')
    .sort({ scheduled_date: 1, priority: -1 });

    res.status(200).json(new apiresponse(200, urgentDeliveries, "Urgent deliveries retrieved successfully"));
  } catch (error) {
    console.error('Error getting urgent deliveries:', error);
    res.status(500).json(new apiresponse(500, null, `Error getting urgent deliveries: ${error.message}`));
  }
});

// Generate delivery document
const generateDeliveryDocument = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const delivery = await Delivery.findById(id)
      .populate('reservation_id', 'status')
      .populate('customer_id', 'name email phone_number')
      .populate('product_id', 'name')
      .populate('team_member_id', 'name');

    if (!delivery) {
      throw new apierror(404, "Delivery not found");
    }

    const deliveryDocument = {
      document_type: `${delivery.operation_type.charAt(0).toUpperCase() + delivery.operation_type.slice(1)} Document`,
      delivery_id: delivery._id,
      reservation_id: delivery.reservation_id._id,
      customer_details: {
        name: delivery.customer_name,
        email: delivery.customer_email,
        phone: delivery.customer_phone
      },
      product_details: {
        name: delivery.product_name,
        quantity: delivery.quantity
      },
      operation_details: {
        type: delivery.operation_type,
        address: delivery.operation_type === 'pickup' ? delivery.pickup_address : delivery.delivery_address,
        scheduled_date: delivery.scheduled_date,
        team_member: delivery.team_member_name || 'Unassigned'
      },
      status: delivery.status,
      priority: delivery.priority,
      is_urgent: delivery.is_urgent,
      generated_at: new Date(),
      instructions: getInstructionsByType(delivery.operation_type)
    };

    res.status(200).json(new apiresponse(200, deliveryDocument, "Delivery document generated successfully"));
  } catch (error) {
    console.error('Error generating delivery document:', error);
    res.status(500).json(new apiresponse(500, null, `Error generating delivery document: ${error.message}`));
  }
});

// Helper function to get instructions based on operation type
const getInstructionsByType = (operationType) => {
  switch (operationType) {
    case 'pickup':
      return [
        'Verify product condition before pickup',
        'Collect customer signature upon pickup',
        'Take photos if needed',
        'Update status in system after pickup',
        'Ensure proper packaging for transport'
      ];
    case 'delivery':
      return [
        'Verify product condition before delivery',
        'Collect customer signature upon delivery',
        'Take photos if needed',
        'Update status in system after delivery',
        'Ensure customer satisfaction'
      ];
    case 'return':
      return [
        'Verify product condition upon return',
        'Check for any damages or missing items',
        'Collect customer signature upon return',
        'Take photos if needed',
        'Update status in system after return',
        'Return items to inventory'
      ];
    default:
      return ['Follow standard operating procedures'];
  }
};

// Get delivery statistics
const getDeliveryStats = asynchandler(async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const stats = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$operation_type',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          in_progress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          scheduled: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          }
        }
      }
    ]);

    const totalDeliveries = await Delivery.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const urgentDeliveries = await Delivery.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      $or: [{ is_urgent: true }, { priority: 'urgent' }]
    });

    res.status(200).json(new apiresponse(200, {
      period,
      totalDeliveries,
      urgentDeliveries,
      breakdown: stats,
      startDate,
      endDate
    }, "Delivery statistics retrieved successfully"));
  } catch (error) {
    console.error('Error getting delivery stats:', error);
    res.status(500).json(new apiresponse(500, null, `Error getting delivery stats: ${error.message}`));
  }
});

export {
  getAllDeliveries,
  getDeliveryById,
  assignTeamMember,
  updateDeliveryStatus,
  getDeliveriesByTeamMember,
  getUrgentDeliveries,
  generateDeliveryDocument,
  getDeliveryStats
};
