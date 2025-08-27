import {EventEmitter} from "events"
import { sendEmail } from "../../service/sendEmail.js"
import { generateToken } from "../token/generateToken.js"

export const eventEmitter = new EventEmitter()

eventEmitter.on("sendEmail", async (data) =>{
  const {email} = data
  const token = await generateToken({payload: {email}, SIGNITURE: process.env.SIGNITURE, options: {expiresIn: 60*3}})
  const link = `http://localhost:3000/users/confirmEmail/${token}`

  const isSent = await sendEmail({to: email, subject: 'Confirm your email', html: `<a href = '${link}'>Confirm Email</a>`})

  if(!isSent) throw new Error('Fail sending email', {cause: 400})
})


eventEmitter.on("forgetPassword", async (data) =>{
  const {email, otp} = data

  const isSent = await sendEmail({to: email,subject: 'Forget Password', html: `<h1>Your Confirmation OTP: ${otp}</h1>`})
  if(!isSent) throw new Error('Fail sending email', {cause: 400})
})