import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const secret = {
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISEC,
};

cloudinary.config(secret);
export default cloudinary;
