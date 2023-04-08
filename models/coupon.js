import mongoose from "mongoose";

// Define the Coupon schema
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  discount: { type: Number, required: true },
  maxdiscount: { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Coupon model
export default mongoose.model("Coupon", couponSchema);
