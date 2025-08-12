import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      required: true,
      unique: true,
      default: () => `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    rental_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalRequest",
      required: true
    },
    reservation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    product_name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    rental_period: {
      start_date: {
        type: Date,
        required: true
      },
      end_date: {
        type: Date,
        required: true
      },
      total_days: {
        type: Number,
        required: true
      }
    },
    pricing: {
      daily_rate: {
        type: Number,
        required: true
      },
      weekly_rate: {
        type: Number
      },
      monthly_rate: {
        type: Number
      },
      yearly_rate: {
        type: Number
      }
    },
    subtotal: {
      type: Number,
      required: true
    },
    security_deposit: {
      type: Number,
      default: 0
    },
    late_fees: {
      type: Number,
      default: 0
    },
    total_amount: {
      type: Number,
      required: true
    },
    payment_status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending"
    },
    payment_details: {
      upfront_payment: {
        type: Number,
        default: 0
      },
      remaining_balance: {
        type: Number,
        default: 0
      },
      payment_method: {
        type: String,
        enum: ["full_upfront", "partial_deposit", "installment"],
        required: true
      },
      installments: [{
        amount: Number,
        due_date: Date,
        paid: {
          type: Boolean,
          default: false
        },
        paid_date: Date
      }]
    },
    late_fee_rules: {
      daily_rate: {
        type: Number,
        default: 0.1 // 10% of daily rate per day
      },
      max_daily_fee: {
        type: Number,
        default: 50 // Maximum $50 per day
      },
      grace_period_days: {
        type: Number,
        default: 1 // 1 day grace period
      }
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft"
    },
    due_date: {
      type: Date,
      required: true
    },
    issued_date: {
      type: Date,
      default: Date.now
    },
    paid_date: Date,
    notes: String,
    admin_notes: String
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
invoiceSchema.index({ customer_id: 1, status: 1 });
invoiceSchema.index({ rental_request_id: 1 });
invoiceSchema.index({ payment_status: 1 });
invoiceSchema.index({ due_date: 1 });
invoiceSchema.index({ invoice_number: 1 });

// Method to calculate late fees
invoiceSchema.methods.calculateLateFees = function() {
  const today = new Date();
  const endDate = new Date(this.rental_period.end_date);
  const gracePeriod = this.late_fee_rules.grace_period_days || 1;
  
  // Add grace period to end date
  const dueDate = new Date(endDate);
  dueDate.setDate(dueDate.getDate() + gracePeriod);
  
  if (today <= dueDate) {
    return 0;
  }
  
  // Calculate days overdue
  const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
  
  // Calculate late fee (daily rate * days overdue, capped at max daily fee)
  const dailyLateFee = Math.min(
    this.pricing.daily_rate * (this.late_fee_rules.daily_rate || 0.1),
    this.late_fee_rules.max_daily_fee || 50
  );
  
  return dailyLateFee * daysOverdue;
};

// Method to update payment status
invoiceSchema.methods.updatePaymentStatus = function() {
  if (this.payment_details.upfront_payment >= this.total_amount) {
    this.payment_status = "paid";
    this.status = "paid";
    this.paid_date = new Date();
  } else if (this.payment_details.upfront_payment > 0) {
    this.payment_status = "partial";
    this.status = "sent";
  } else {
    this.payment_status = "pending";
    this.status = "sent";
  }
  
  // Check for overdue status
  const today = new Date();
  if (today > this.due_date && this.payment_status !== "paid") {
    this.status = "overdue";
    this.payment_status = "overdue";
  }
};

// Pre-save middleware to update payment status and calculate late fees
invoiceSchema.pre("save", function(next) {
  this.late_fees = this.calculateLateFees();
  this.updatePaymentStatus();
  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
