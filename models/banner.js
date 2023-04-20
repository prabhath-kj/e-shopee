import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  headline: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
  additionalInfo: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
