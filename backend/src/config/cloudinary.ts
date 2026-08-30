import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function getCloudinaryTimestamp() {
  try {
    const response = await fetch("https://api.cloudinary.com");
    const serverDate = response.headers.get("date");

    if (serverDate) {
      return Math.floor(new Date(serverDate).getTime() / 1000);
    }
  } catch (error) {
    console.warn("Unable to read Cloudinary server time:", error);
  }

  return Math.floor(Date.now() / 1000);
}

export default cloudinary;
