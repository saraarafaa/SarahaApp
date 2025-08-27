import Joi from "joi";
import { generalRules } from "../../utils/index.js";

export const sendMessageSchema = {
  body: Joi.object({
    userId: generalRules.id.required(),
    content: Joi.string().min(1).required()
  }).required()
}

export const getMessageSchema = {
  params: Joi.object({
    id: generalRules.id.required(),
  }).required()
}