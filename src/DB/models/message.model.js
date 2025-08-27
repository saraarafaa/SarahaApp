import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  content:{
    type: String,
    requiered: true,
    minLength: 1,
    trim: true
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    requiered: true
  }
},{

  timestamps: true, 
}
)

const messageModel = mongoose.models.message || mongoose.model('message', messageSchema)

export default messageModel;