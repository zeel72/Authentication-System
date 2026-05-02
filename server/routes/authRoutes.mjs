import express from 'express';
import { logout,login,register,sendVerifyotp,verfyEmail,resetPassword,sendresetdotp } from '../controller/authController.mjs';
import  userauth  from '../middleware/userauth.mjs';

const authRouter = express.Router();
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userauth,sendVerifyotp);
authRouter.post('/verify-account',userauth,verfyEmail);
authRouter.post('/reset-password',userauth,resetPassword);
authRouter.post('/send-reset-otp',userauth,sendresetdotp);


export default authRouter;



