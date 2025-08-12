import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userschema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone_number: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
      default: "customer",
    },
    avatar_image_url: {
      type: String,
      default: null
    },
    refreshtoken: {
      type: String,
    },
  },
  { timestamps: true }
);

userschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userschema.methods.ispasswordcorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userschema.methods.generateaccesstoken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET || "1234",
    {
      expiresIn: "1d",
    }
  );
};

userschema.methods.generaterefreshtoken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET || "parth12",
    {
      expiresIn: "3d",
    }
  );
};

export const User = mongoose.model("User", userschema);