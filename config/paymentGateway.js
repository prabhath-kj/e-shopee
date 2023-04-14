import Razorpay from "razorpay";

import dotenv from "dotenv";
dotenv.config();

var instance = new Razorpay({
  key_id: process.env.KEYID,
  key_secret: process.env.KEYSECRET,
});

export default instance;
