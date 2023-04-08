import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobnumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    status: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    wallet: {
      type: Number,
      default: 0,
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("user", UserSchema);
