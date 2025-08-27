import * as US from "./user.service.js";
import * as UV from "./user.validator.js";
import { Router } from "express";
import { authorization } from "../../middleware/authorization.js";
import { authentication } from "../../middleware/authentication.js";
import { validation } from "../../middleware/validation.js";
import { userRole } from "../../DB/models/user.model.js";
import { allowedExtensions, MulterHost } from "../../middleware/Multer.js";
import messageRouter from "../messages/message.controller.js";

export const userRouter = Router()
userRouter.use('/:id/messages', messageRouter)

userRouter.post('/signup',
  MulterHost({ customExtensions: allowedExtensions.image})
  .fields([
    {name: 'attachment', maxCount: 1},
    {name: 'attachments', maxCount: 2},
  ]),
  validation(UV.signUpSchema),
  US.signUp)
userRouter.post('/signIn',validation(UV.signInSchema), US.signIn)
userRouter.post('/loginWithGmail', US.loginWithGmail)
userRouter.post('/logout',authentication, US.logout)
userRouter.post('/refreshtoken', US.refreshToken)
userRouter.patch('/updatePassword',validation(UV.updatePasswordSchema), authentication, US.updatePassword)
userRouter.patch('/updateProfile',validation(UV.updateProfileSchema), authentication, US.updateProfile)

userRouter.patch('/updateImage', authentication,
  MulterHost({ customExtensions: allowedExtensions.image})
  .single( 'attachment'),
  validation(UV.updateProfileImageSchema), US.updateProfileImage) 

userRouter.patch('/resetPassword',validation(UV.resetPassworddSchema), US.resetPassword)
userRouter.patch('/forgetPassword',validation(UV.forgetPasswordSchema), US.forgetPassword)
userRouter.get('/profile', authentication, authorization([userRole.user]), US.getProfile)
userRouter.delete('/freeze/{:id}', validation(UV.freezeProfileSchema), authentication, US.freezeProfile)
userRouter.post('/unfreeze/{:id}', validation(UV.unFreezeProfileSchema), authentication, US.unfreezeProfile)
userRouter.get('/profile/:id', US.getProfileData)
userRouter.get('/confirmEmail/:token', US.confirmEmail)
userRouter.delete('/:id', authentication, US.deleteAccount)