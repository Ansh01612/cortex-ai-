import axios from "axios"
import { PLANS } from "../config/Plans.js"
import razorpay from "../config/razorpay.js"
import Payment from "../models/payment.model.js"
import crypto from "crypto"
import User from "../../auth/models/user.model.js"
import redis from "../../../shared/redis/redis.js"
export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body
        const userId = req.headers["x-user-id"]
        const selectedPlan = PLANS[plan]

        if (!selectedPlan) {
            return res.status(404).json({ message: "plan not found" })
        }

        const order = await razorpay.orders.create({
            amount: selectedPlan.amount * 100,
            currency: "INR",
            receipt: `receipt-${Date.now()}`
        })

        await Payment.create({
            userId,
            orderId: order.id,
            amount: selectedPlan.amount,
            credits: selectedPlan.credits,
            plan: selectedPlan.id,
            currency: order.currency,
            status: "created"
        })

        return res.status(200).json({ order, plan: selectedPlan })



    } catch (error) {
        return res.status(500).json({ message: `create order error ${error}` })
    }
}


export const verifyPayment = async (req,res) => {
    try {
        const {razorpay_order_id, razorpay_payment_id,razorpay_signature} = req.body

        const generateSignature=crypto
                               .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
                               .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                               .digest("hex")

 if(generateSignature !== razorpay_signature){
    return res.status(400).json({message:"Payment Verification Failed"})
 }

 const payment=await Payment.findOne({orderId:razorpay_order_id})

 if(!payment){
    return res.status(404).json({message:"Payment Not Found"})
 }

 payment.status="paid"
 payment.paymentId=razorpay_payment_id
 await payment.save()

 if (process.env.VERCEL === "1") {
    const user = await User.findById(payment.userId)
    if (!user) return res.status(404).json({ message: "User not found" })
    user.plan = payment.plan
    user.credits += payment.credits
    user.totalCredits += payment.credits
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
 } else {
    await axios.post(`${process.env.AUTH_SERVICE}/update-plan`,{userId:payment.userId,plan:payment.plan,credits:payment.credits})
 }

 return res.status(200).json({message:"Payment Verified"})

    } catch (error) {
 return res.status(500).json({message:`verify payment error ${error}`})
    }
}