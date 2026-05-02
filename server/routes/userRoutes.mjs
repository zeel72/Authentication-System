import express from 'express';
import userauth from '../middleware/userauth.mjs';
import { getUserdata } from '../controller/userController.mjs';


const userRouter = express.Router();
userRouter.get('/profile',userauth,getUserdata);
export default userRouter;