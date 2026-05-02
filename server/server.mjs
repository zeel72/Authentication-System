import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';  
import { connect } from 'mongoose';
import connectDB from './config/mongodb.mjs';
import authRouter from './routes/authRoutes.mjs';
import userRouter from './routes/userRoutes.mjs';

const app = express();
const PORT = process.env.PORT || 5463;
connectDB();
app.use(cookieParser());    
app.use(express.json());
app.use(cors({credentials: true})); 
app.get('/', (req, res) => {res.send('API is running successfully');});
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);

app.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));