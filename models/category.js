import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
    required: true,
    unique: true,
  },
  CategoryDescription: {
    type: String,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
});

const Category = mongoose.model("category", categorySchema);

export default Category;
