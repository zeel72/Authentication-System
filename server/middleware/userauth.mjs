import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const token =req.cookies.token;
    if (!token) {
        return res.json({ success: false, message: 'Unauthorized access' });
    }
    try{
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = tokenDecode.Id;
        next();
    }
    catch(error){
        res.json({ success: false, message: 'Invalid token', error: error.message });
    }

}
export default userAuth;