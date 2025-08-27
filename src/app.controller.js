import { checkConnectionDB } from "./DB/connectionDB.js"
import { globalErrorHandling } from "./middleware/globalErrorHandling.js"
import { userRouter } from "./modules/user/user.controller.js"
import messageRouter from "./modules/messages/message.controller.js"
import express from 'express'
const app = express()
const port = process.env.PORT || 5000
import cors from 'cors'
import rateLimit from "express-rate-limit"
import helmet from "helmet"

var whitelist = [process.env.FRONT_END, undefined]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    } 
  }
}

const bootstrap = () =>{
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message:{
      error: 'Too many requests, please try again later.'
    },
    statusCode: 429

  })
  app.use('/uploads', express.static("uploads"))
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(limiter)
  app.use(helmet())

  checkConnectionDB()

  app.use('/users', userRouter)
  app.use('/messages', messageRouter)

  app.use('{/*demo}', (req, res, next) =>{
    throw new Error(`Url Not Found ${req.originalUrl}`)
})

  app.use(globalErrorHandling)

  app.listen(port, () => console.log(`Server is listening on port ${port}!`))

}


export default bootstrap