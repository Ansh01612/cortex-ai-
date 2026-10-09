import mongoose from "mongoose"

const connectDb=async ()=>{
    const uri = process.env.MONGODB_URI

    if (!uri) {
        throw new Error("MONGODB_URI is not set in the auth environment")
    }

    if (uri.includes("<db_username>") || uri.includes("<db_password>")) {
        throw new Error("MONGODB_URI still contains a placeholder in services/auth/.env")
    }

    try {
       await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
       console.log("Auth MongoDB connected")
    } catch (error) {
       if (error?.code === 18 || error?.codeName === "AuthenticationFailed" || /bad auth|authentication failed/i.test(error?.message ?? "")) {
           throw new Error("MongoDB authentication failed. Check the Atlas database username and password in services/auth/.env")
       }

       throw new Error(`Auth MongoDB connection failed (${error?.name ?? "unknown error"}). Check Atlas network access and cluster availability.`)
    }
}

export default connectDb