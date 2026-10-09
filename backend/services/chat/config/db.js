import mongoose from "mongoose"

const connectDb=async ()=>{
    const uri = process.env.MONGODB_URI

    if (!uri) {
        throw new Error("MONGODB_URI is not set in the chat environment")
    }

    if (uri.includes("<db_username>") || uri.includes("<db_password>")) {
        throw new Error("MONGODB_URI still contains a placeholder. Replace it with the Atlas database user's connection URI in services/chat/.env")
    }

    try {
       await mongoose.connect(uri)
       console.log("Chat MongoDB connected")
    } catch (error) {
       if (error?.code === 18 || error?.codeName === "AuthenticationFailed" || /bad auth|authentication failed/i.test(error?.message ?? "")) {
           throw new Error("MongoDB authentication failed. Check the Atlas database username and password in services/chat/.env")
       }

       throw new Error(`Chat MongoDB connection failed (${error?.name ?? "unknown error"})`)
    }
}

export default connectDb