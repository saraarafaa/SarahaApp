import Joi from "joi"
import { Types } from "mongoose"

export const customId = (value, helper) =>{
  const data = Types.ObjectId.isValid(value)
  return data ? value : helper
}

export const generalRules = {
  id: Joi.string().custom(customId),
  email: Joi.string().email({tlds: {allow: ['com', 'org']}}),
  password: Joi.string(),
  headers: Joi.object({
    authorization: Joi.string().required(),
    host: Joi.string().required(),
    "accept-encoding": Joi.string().required(),
    "content-type": Joi.string().required(),
    "content-length": Joi.string().required(),
    "connection": Joi.string().required(),
    "user-agent": Joi.string().required(),
    "accept": Joi.string().required(),
    "postman-token": Joi.string().required()
  }),
  file: Joi.object({
    size: Joi.number().positive().required(),
    path: Joi.string().required(),
    filename: Joi.string().required(),
    destination: Joi.string().required(),
    mimetype: Joi.string().required(),
    encoding: Joi.string().required(),
    originalname: Joi.string().required(),
    fieldname: Joi.string().required(),
  }).messages({
    "any.required": "file is required"
  })
}