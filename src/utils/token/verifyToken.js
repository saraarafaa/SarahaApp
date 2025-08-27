import jwt from "jsonwebtoken"

export const verifyToken = async ({token, SIGNITURE} = {}) =>{
  return jwt.verify(token, SIGNITURE)
}