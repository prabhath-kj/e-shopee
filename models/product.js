const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    tittle: { type: String, reuired: true },
    desc: {
      type: String,
      required: true,
      unqiue: true,
    },
    size: { type: String, required: true },
    price: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("product", ProductSchema);
