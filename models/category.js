const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
    reuired: true,
    unique: true,
  },
  CategoryDescription: {
    type: String,
    reuired: true,
  },
});
module.exports = mongoose.model("category", categorySchema);
