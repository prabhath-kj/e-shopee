import mongoose from "mongoose";

const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now,
      required: true
    }
  }]
});

export default mongoose.model('Wishlist', wishlistSchema);
