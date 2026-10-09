import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import authRouter from "../services/auth/routes/auth.route.js"
import chatRouter from "../services/chat/routes/chat.routes.js"
import agentRouter from "../services/agent/routes/agent.route.js"
import billingRouter from "../services/billing/routes/billing.route.js"

dotenv.config()

const app = express()

if (process.env.VERCEL !== "1") {
    app.use(cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    }))
}

app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/chat", protect, chatRouter)
app.use("/api/agent", protect, agentRouter)
app.use("/api/billing", protect, billingRouter)
app.get("/api/me", protect, getCurrentUser)
app.get("/api/health", (req, res) => res.json({ status: "ok" }))

export default app
