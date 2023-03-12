const dotenv = require("dotenv");
dotenv.config();
const databaseName = "e-shopee";
module.exports = {
  url: process.env.MONGO_URL,
  databaseName,
};
