import mongoose from "mongoose";

const PaymentSchema = new Schema(
  {
    invoice_id: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payment_gateway_ref: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);


export const Payment = mongoose.model('Payment', PaymentSchema);