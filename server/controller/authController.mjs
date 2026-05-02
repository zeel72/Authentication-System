import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.mjs';
import transporter from '../config/nodemailer.mjs';


export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'All fields are required' });
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' });
        }
        const hashedPassword = await bycrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();
       

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Our App',
            text: `Hello ${name},\n\nThank you for registering with our app!`,
        };
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'User registered successfully' });

    } catch (error) {
        res.json({ success: false, message: 'Error registering user', error: error.message });


    }

}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: 'All fields are required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User does not exist' });
        }
        const isPasswordValid = await bycrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: 'Invalid password' });
        }
        const token = jwt.sign({ Id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxage: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ success: true, message: 'User logged in successfully' });
    }


    catch (error) {
        res.json({ success: false, message: 'Error logging in user', error: error.message });
    }


}
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        res.json({ success: true, message: 'User logged out successfully' });
    }
    catch (error) {
        res.json({ success: false, message: 'Error logging out user', error: error.message });
    }
}
export const sendVerifyotp = async (req,res) => {
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success:false,message:"User not found"});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpiryAt = Date.now() + 24*10 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your OTP for Account Verification',
            text: `Hello ${user.name},\n\nYour OTP for account verification is: ${otp}\n\nThis OTP is valid for 24 hours.`,
    }
        await transporter.sendMail(mailOptions);
        res.json({success:true,message:"OTP sent to your email"});
    }
    catch (error) {
        res.json({success:false,message:"error sending otp"});
    }
}

export const verfyEmail = async (req,res) => {
    try {
        const {userId,otp} = req.body;
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success:false,message:"User not found"});
        }
        if(user.verifyOtp !== otp || user.verifyOtpExpiryAt < Date.now()){
            return res.json({success:false,message:"Invalid or expired OTP"});
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpiryAt = 0;
        await user.save();
        res.json({success:true,message:"Email verified successfully"});
    }
    catch(error){
        res.json({success:false,message:"Error verifying email"});
    }
}

export const sendresetdotp = async (req,res) => {
        const {email} = req.body;
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"User not found"});

        }
        try{
        const otp = String(Math.floor(100000 + Math.random()*900000));
        user.resetOtp = otp;
        user.resetOtpExpiryAt = Date.now() + 15*60*1000;
        await user.save();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Password Reset',
            text: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
        }
        await transporter.sendMail(mailOptions);
        res.json({success:true,message:"OTP sent to your email"});

    }
    catch(error){
        res.json({success : false,message : "Error resetting password"});
    }
}

export const resetPassword = async (req,res) => {
    const {email,otp,newPassword} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return res.json({success:false,message:"User not found"});
    }
    if(user.resetOtp !== otp || user.resetOtpExpiryAt < Date.now()){
        return res.json({success:false,message:"Invalid or expired OTP"});
    }
    try{
        const hashedPassword = await bycrypt.hash(newPassword,10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiryAt = 0;
        await user.save();
        res.json({success:true,message:"Password reset successfully"});
    }
    catch(error){
        res.json({success:false,message:"Error resetting password"});
    }
}
