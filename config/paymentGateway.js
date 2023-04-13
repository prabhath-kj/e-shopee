import Razorpay from "razorpay";

import dotenv from "dotenv";
dotenv.config();

var instance = new Razorpay({
  key_id: "rzp_test_iXVubQytayWOm1",
  key_secret: "smzhEAy0eORV067XwguH5L4h",
});

export default instance;
