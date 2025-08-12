import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Product } from "../models/products.models.js";
import { RentalRequest } from "../models/rentalRequest.models.js";
import { User } from "../models/user.models.js";

// Get order summary report with date/time and user details
const getOrderSummary = asynchandler(async (req, res) => {
  try {
    const { period = 'last_30_days' } = req.query;
    
    let startDate = new Date();
    let endDate = new Date();
    
    // Calculate date range based on period
    switch (period) {
      case 'last_7_days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'last_30_days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'last_quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'last_year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    console.log('Date range:', { startDate, endDate, period });

    // Get rental requests in the period with user details
    const rentalRequests = await RentalRequest.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('customer_id', 'name email phone_number');

    console.log('Found rental requests:', rentalRequests.length);

  // Format orders with detailed information
  const orderSummary = rentalRequests.map(rental => {
    const customer = rental.customer_id;
    const orderDate = new Date(rental.createdAt);
    
    return {
      orderId: rental._id,
      customerName: customer ? customer.name : rental.customer_name,
      customerEmail: customer ? customer.email : rental.customer_email,
      customerPhone: customer ? customer.phone_number : 'N/A',
      productName: rental.product_name,
      quantity: rental.quantity,
      totalAmount: rental.total_amount,
      status: rental.status,
      paymentStatus: rental.payment_status,
      orderDate: orderDate.toLocaleDateString('en-IN'),
      orderTime: orderDate.toLocaleTimeString('en-IN'),
      orderDateTime: orderDate.toISOString(),
      rentalPeriod: {
        startDate: rental.rental_period?.start_date ? new Date(rental.rental_period.start_date).toLocaleDateString('en-IN') : 'N/A',
        endDate: rental.rental_period?.end_date ? new Date(rental.rental_period.end_date).toLocaleDateString('en-IN') : 'N/A',
        duration: `${rental.rental_period?.duration_value || 0} ${rental.rental_period?.duration_type || 'days'}`
      },
      pickupAddress: rental.pickup_address,
      deliveryAddress: rental.delivery_address
    };
  });

  // Sort by order date (newest first)
  orderSummary.sort((a, b) => new Date(b.orderDateTime) - new Date(a.orderDateTime));

  // Group by date for summary
  const ordersByDate = {};
  orderSummary.forEach(order => {
    const dateKey = order.orderDate;
    if (!ordersByDate[dateKey]) {
      ordersByDate[dateKey] = {
        date: dateKey,
        totalOrders: 0,
        totalRevenue: 0,
        orders: []
      };
    }
    ordersByDate[dateKey].totalOrders++;
    ordersByDate[dateKey].totalRevenue += order.totalAmount;
    ordersByDate[dateKey].orders.push(order);
  });

  // Convert to array and sort by date
  const datewiseSummary = Object.values(ordersByDate).sort((a, b) => 
    new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-'))
  );

  // Calculate overall summary
  const totalOrders = orderSummary.length;
  const totalRevenue = orderSummary.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orderSummary.filter(order => order.status === 'pending').length;
  const approvedOrders = orderSummary.filter(order => order.status === 'approved').length;
  const completedOrders = orderSummary.filter(order => order.status === 'completed').length;

  const report = {
    period,
    dateRange: { 
      start: startDate.toLocaleDateString('en-IN'),
      end: endDate.toLocaleDateString('en-IN')
    },
    summary: {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingOrders,
      approvedOrders,
      completedOrders
    },
    datewiseSummary,
    orderDetails: orderSummary,
    generatedAt: new Date().toLocaleString('en-IN')
  };

    res.status(200).json(new apiresponse(200, report, "Order summary report generated successfully"));
  } catch (error) {
    console.error('Error in getOrderSummary:', error);
    res.status(500).json(new apiresponse(500, null, `Error generating report: ${error.message}`));
  }
});

// Get comprehensive dashboard report (simplified)
const getDashboardReport = asynchandler(async (req, res) => {
  try {
    // Get quick stats for dashboard
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalRentals = await RentalRequest.countDocuments();
    const activeRentals = await RentalRequest.countDocuments({ 
      status: { $in: ['approved', 'completed'] },
      payment_status: 'paid'
    });
    
    // Get recent orders
    const recentOrders = await RentalRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer_id', 'name email')
      .select('customer_id customer_name product_name total_amount status createdAt');

    const report = {
      summary: {
        totalProducts,
        totalCustomers,
        totalRentals,
        activeRentals
      },
      recentOrders: recentOrders.map(order => ({
        customerName: order.customer_id?.name || order.customer_name,
        customerEmail: order.customer_id?.email || 'N/A',
        productName: order.product_name,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.createdAt
      })),
      generatedAt: new Date()
    };

    res.status(200).json(new apiresponse(200, report, "Dashboard report generated successfully"));
  } catch (error) {
    console.error('Error in getDashboardReport:', error);
    res.status(500).json(new apiresponse(500, null, `Error generating dashboard report: ${error.message}`));
  }
});

export {
  getOrderSummary,
  getDashboardReport
};
