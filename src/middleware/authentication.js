import jwt from "jsonwebtoken"
import userModel from "../DB/models/user.model.js"
import { verifyToken } from "../utils/token/verifyToken.js"
import revokeToken from "../DB/models/revoke-token.model.js"


export const authentication = async(req, res, next) =>{
    const {authorization} = req.headers
    const [prefix, token] = authorization.split(" ") || []

    let signature = ""
    if(!prefix || !token){
      throw new Error('Token Not Sent', {cause: 404})

    }

    if(prefix == 'bearer'){
      signature = process.env.ACCESS_TOKEN
    }
    else if(prefix == 'admin'){
      signature = process.env.ACCESS_TOKEN_ADMIN
    }
    else{
      throw new Error('InValid Prefix', {cause: 400})

    }
    
      const decode = await verifyToken({token, SIGNITURE: signature})

      const revoked = await revokeToken.findOne({tokenId: decode.jti})
      if(revoked){
        throw new Error('User logged Out', {cause: 400})
      }

      const user = await userModel.findOne({email: decode.email})

      if(!user){
        throw new Error('User Not Found', {cause: 404})
      }

     
      req.user = user
      req.decode = decode

      return next()
}
