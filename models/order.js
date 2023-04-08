import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit_price: {
    type: Number,
    required: true,
  },
});

const OrderItem = mongoose.model("OrderItem", OrderItemSchema);

const OrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  payment_status: {
    type: String,
    enum: ["paid", "pending", "cancelled"],
    default: "pending",
  },
  payment_method: {
    type: String,
    enum: ["upi", "paypal", "cash_on_delivery","stripe"],
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  order_status: {
    type: String,
    required: true,
  },
  items: [OrderItemSchema],
});

const Order = mongoose.model("Order", OrderSchema);

const AddressSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },

  street_name: {
    type: String,
    required: true,
  },
  apartment_number: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postal_code: {
    type: String,
    required: true,
  },
  mobile_Number: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  default_address: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const Address = mongoose.model("Address", AddressSchema);

export { Order, OrderItem, Address };
