import mongoose, { Schema } from "mongoose";

const productschema=new Schema(
    {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
    },
    category: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    is_rentable: {
      type: Boolean,
      default: true,
    },
    average_rating: {
      type: Number,
      default: 0,
    },
    provider_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    },{timestamps:true}
)

export const Product = mongoose.model('Product', productschema);