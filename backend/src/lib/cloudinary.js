import {v2 as cloudinary} from "cloudinary"

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

// Log to verify configuration (without exposing secrets)
console.log("Cloudinary Config Check:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing");

export default cloudinary;