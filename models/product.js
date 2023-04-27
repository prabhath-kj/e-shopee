import mongoose from "mongoose";
import slugify from "slugify";
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  productModel: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productImage: {
    type: Array,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  productStatus: {
    type: String,
    default: "Unlisted",
  },
  productQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  productColor: {
    type: String,
  },
});
productSchema.pre("save", function (next) {
  const product = this;

  if (!product.isModified("productName")) {
    return next();
  }

  const slug = slugify(product.productName, { lower: true });
  product.slug = slug;
  next();
});
const product = mongoose.model("Product", productSchema);

export default product;
