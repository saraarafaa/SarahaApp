import Joi from "joi";
import { userGender } from "../../DB/models/user.model.js";
import { generalRules } from "../../utils/generalRules/generalRules.js";


export const signUpSchema = {
  body: Joi.object({
    name: Joi.string().alphanum().min(3).max(20),
    email: generalRules.email,
    password: generalRules.password,
    cPassword: Joi.string().valid(Joi.ref('password')),
    gender: Joi.string().valid(userGender.male, userGender.female),
    phone: Joi.string(),
    age: Joi.number().min(18).max(60)
    }).options({presence: "required"}),
  files: Joi.object({
    attachments: Joi.array().items(generalRules.file).required(),
    attachment: Joi.array().items(generalRules.file).required(),
  }).required()

}
export const signInSchema = {
  body: Joi.object({
    email: generalRules.email,
    password: generalRules.password,
    }).options({presence: "required"}),

}
export const updateProfileImageSchema = {
  file: generalRules.file.required()

}
export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: generalRules.password,
    newPassword: generalRules.password,
    cPassword: Joi.string().valid(Joi.ref('newPassword')),
    }).options({presence: "required"}),

}

export const forgetPasswordSchema = {
  body: Joi.object({
    email: generalRules.email
    }).options({presence: "required"}),

}

export const resetPassworddSchema = {
  body: Joi.object({
    email: generalRules.email,
    newPassword: generalRules.password,
    cPassword: Joi.string().valid(Joi.ref('newPassword')),
    otp: Joi.string().length(4)
    }).options({presence: "required"}),

}

export const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().alphanum().min(3).max(20),
    email: generalRules.email,
    gender: Joi.string().valid(userGender.male, userGender.female),
    phone: Joi.string(),
    age: Joi.number().min(18).max(60)
    }),

}

export const freezeProfileSchema = {
  params: Joi.object({
    id: generalRules.id
    }),

}

export const unFreezeProfileSchema = freezeProfileSchema