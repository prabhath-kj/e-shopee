const mongoose = require("mongoose");
const databaseName = "e-shopee";
const url = process.env.MONGO_URL;
const connectDB = async () => {
  try {
    await mongoose.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  } catch (err) {
    console.error(err);
  }
};
module.exports = {
  connectDB,
  databaseName,
};
