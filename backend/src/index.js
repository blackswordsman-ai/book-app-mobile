import express from 'express';
import "dotenv/config"
import {connectDB} from "./lib/db.js"
import dotenv from "dotenv/config"
import cors from "cors"
import job from "./lib/cron.js" // cron job to send GET request every 14 minutes        


import authRoutes from "./routes/authRoute.js"
import bookRoutes from "./routes/bookRoute.js"

job.start();
const app =express()
const PORT =process.env.PORT || 3000;
app.use(express.json())
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