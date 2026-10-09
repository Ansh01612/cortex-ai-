import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"
import Message from "../../chat/models/message.model.js"


export const agent=async (req,res,next) => {
    try {
        const {prompt,conversationId,agent}=req.body
        const file=req.file
        const userId=req.headers["x-user-id"]
        const saveMessage = async (message) => {
            if (process.env.VERCEL === "1") {
                return Message.create(message)
            }
            return axios.post(`${process.env.CHAT_SERVICE}/save-message`, message)
        }

        await saveMessage({conversationId,role:"user",content:prompt})
        const result=await graph.invoke({
            prompt,conversationId,agent,userId,file
        })
       await addMessage(conversationId,"user",prompt)
        await addMessage(conversationId,"assistant",result.aiResponse)
        await saveMessage({
            conversationId,role:"assistant",content:result?.aiResponse,images:result?.images,artifacts:result?.artifacts
        })
        return res.status(200).json({
            answer:result?.aiResponse,
            images:result?.images,
            artifacts:result?.artifacts
        })
       
    } catch (error) {
       next(error)
    }
}