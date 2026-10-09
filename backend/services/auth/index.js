import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import router from "./routes/auth.route.js"
dotenv.config()

const port =process.env.PORT

const app=express()
app.use(express.json())
app.use("/",router)
app.get("/",(req,res)=>{
    res.json({message:"hello from auth"})
})

const start = async () => {
    try {
        await connectDb()
        app.listen(port,()=>{
            console.log(`auth started at ${port}`)
        })
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
}

start()
