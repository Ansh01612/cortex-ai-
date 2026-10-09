import mongoose from "mongoose"
import app from "../backend/gateway/app.js"

let connectionPromise

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured")
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    }).catch((error) => {
      connectionPromise = undefined
      throw error
    })
  }

  await connectionPromise
}

export default async function handler(req, res) {
  try {
    await connectDatabase()
    return app(req, res)
  } catch (error) {
    console.error("Serverless API initialization failed:", error.name)
    return res.status(503).json({
      message: "The API is temporarily unavailable. Check the MongoDB connection and deployment environment."
    })
  }
}
