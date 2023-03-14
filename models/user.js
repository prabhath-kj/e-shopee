const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, reuired: true },
    email: {
      type: String,
      required: true,
      unqiue: true,
    },
    mobnumber: { type: String, required: true, unqiue: true },
    password: { type: String, required: true },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("user", UserSchema);
