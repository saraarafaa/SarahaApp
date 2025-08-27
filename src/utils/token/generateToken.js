import jwt from 'jsonwebtoken'
export const generateToken = async ({payload, SIGNITURE, options}) =>{
  return jwt.sign(payload, SIGNITURE, options )
}