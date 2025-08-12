import { apierror } from "../utils/apierror.js" ;
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT =asynchandler(async(req,res,next) =>{

    try {
        const token=req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
        console.log(token);
        
        if(!token){
            throw new apierror(401,"unauthorized request")
        }
    
        const decodedtoken = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET || "access_secret"
        )
        
        const user=await User.findById(decodedtoken?._id).select("-refreshtoken")
    
        console.log(user);
        if(!user){
            throw new apierror(401,"Invalid Access Token")
        }
    
        req.user=user;
        next()
        
    } catch (error) {
        throw new apierror(401,error?.message || "Invalid access Token")
    }
})