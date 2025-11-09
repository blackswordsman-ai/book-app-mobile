import express from 'express';
import "dotenv/config"
import {connectDB} from "./lib/db.js"
import cors from "cors"
import job from "./lib/cron.js" // cron job to send GET request every 14 minutes        


import authRoutes from "./routes/authRoute.js"
import bookRoutes from "./routes/bookRoute.js"

// Verify critical environment variables
console.log("=== Environment Variables Check ===");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Set" : "✗ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Set" : "✗ Missing");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing");
console.log("===================================");

job.start();
const app =express()
const PORT =process.env.PORT || 3000;
app.use(express.json({limit: '50mb'})) // Increase limit for base64 images
app.use(express.urlencoded({limit: '50mb', extended: true}))
app.use(cors())


app.use("/api/auth",authRoutes)
app.use("/api/books",bookRoutes)
 

const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT,() => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

startServer()