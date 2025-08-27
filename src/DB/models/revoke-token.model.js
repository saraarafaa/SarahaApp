import mongoose from "mongoose";

const RevokeToken = new mongoose.Schema({
  tokenId:{
    type: String,
    requiered: true,
  },
  expireAt:{
    type: String,
    requiered: true
  }
},{

  timestamps: true, 
}
)

const revokeTokenModel = mongoose.models.revokeToken || mongoose.model('revokeToken', RevokeToken)

export default revokeTokenModel;