import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { authentication } from "../../middleware/authentication.js";
import * as MS from "./message.service.js";
import * as MV from "./message.validator.js";
const messageRouter = Router({mergeParams: true})

messageRouter.post('/send', validation(MV.sendMessageSchema), MS.sendMessage)
messageRouter.get('/', authentication, MS.listMessages)
messageRouter.get('/:id', validation(MV.getMessageSchema), authentication, MS.getMessage)


export default messageRouter