import userModel from "../models/userModel.mjs";
 
export const getUserdata = async (req, res) => {
    try{
        const {userId} = req.body;
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success : false,message : "User not found"});
        }

        res.json({
            success : true,
            userdata : {
                username : user.name,
                email : user.email,
                isAccountVerified : user.isAccountVerified
            }
        });
    }
    catch(error){
        res.json({success : false,message : "Error fetching user data"});
    }
}
