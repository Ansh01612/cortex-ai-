import axios from "axios"
import User from "../../auth/models/user.model.js"
import redis from "../../../shared/redis/redis.js"

export const deductCredits=async (userId,agent)=>{
    try {
       if (process.env.VERCEL === "1") {
          const costs = { chat: 1, search: 5, coding: 10, pdf: 10, ppt: 10, vision: 10 }
          const user = await User.findById(userId)
          if (!user) throw new Error("User not found")
          const cost = costs[agent] || 1
          if (user.credits < cost) throw new Error("Not enough credits.")
          user.credits -= cost
          await user.save()

          const sessionId = await redis.get(`user-session-${user._id}`)
          if (sessionId) {
             await redis.set(`session-${sessionId}`, JSON.stringify({
                userId: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                plan: user.plan,
                credits: user.credits,
                totalCredits: user.totalCredits,
                planExpiresAt: user.planExpiresAt
             }), "EX", 7 * 24 * 60 * 60)
          }

          return { success: true, credits: user.credits }
       }
       const {data}=await axios.post(`${process.env.AUTH_SERVICE}/deduct-credits`,{userId,agent})
       return data
    } catch (error) {
        console.log(error)
        return null
    }
}