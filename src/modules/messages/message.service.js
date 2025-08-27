import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js"

//---------------------- SEND MESSAGE ----------------------
export const sendMessage = async(req, res, next) =>{
  const {userId, content} = req.body

  if(!await userModel.findOne({_id: userId, isDeleted: {$exists: false}})){
    throw new Error("User Not Exist Or Account Freezed", {cause: 404});
  }
  const message = await messageModel.create({userId, content})
  return res.status(201).json({message: 'Message sent', message})
}

//---------------------- LIST MESSAGES ----------------------
export const listMessages = async(req, res, next) =>{
  const messages = await messageModel.find({userId: req?.params?.id}).populate([
    {
      path: 'userId',
      select: 'name'
    }
  ])
  if(messages.length == 0) throw new Error("No messages for this user", {cause: 404});

  return res.status(200).json({message: 'success', messages})
  
}

//---------------------- GET ONE MESSAGE ----------------------
export const getMessage = async(req, res, next) =>{
  const {id} = req.params

  const message = await messageModel.findOne({userId: req?.user?._id, _id: id})
  if(!message) throw new Error("message not found", {cause: 404});

  return res.status(200).json({message: 'success', message})
}


