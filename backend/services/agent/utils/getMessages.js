import axios from "axios"
import Message from "../../chat/models/message.model.js"

export const getMessages=async (conversationId)=>{
    try {
       if (process.env.VERCEL === "1") {
          return await Message.find({conversationId})
       }
       const {data}=await axios.get(`${process.env.CHAT_SERVICE}/get-messages/${conversationId}`)
       return data
    } catch (error) {
        console.log(error)
        return null
    }
}