import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { User } from "../models/user.models.js";
import { apiresponse } from "../utils/apiresponse.js";
import { uploadoncloudinary } from "../utils/cloudnary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateaccessandrefreshtokens = async (userid) => {
  try {
    const user = await User.findById(userid);
    if (!user) {
      throw new apierror(404, "User not found while generating tokens");
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access_secret";
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

    const payload = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accesstoken = jwt.sign(payload, accessTokenSecret, { expiresIn: "1d" });
    const refreshtoken = jwt.sign(payload, refreshTokenSecret, { expiresIn: "3d" });

    user.refreshtoken = refreshtoken;
    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new apierror(
      500,
      "Something Went wrong While generating refresh and access token"
    );
  }
};

const registeruser = asynchandler(async (req, res) => {
  const { name, email, password, role = "customer", phone_number } = req.body;
  console.log(req.body);

  if ([name, email, password].some((field) => !field || field.toString().trim() === "")) {
    throw new apierror(400, "Name, email and password are required");
  }

  const existeduser = await User.findOne({ email });
  if (existeduser) {
    throw new apierror(409, "User with this email already exists");
  }

  const user = await User.create({ name, email, password, role, phone_number });

  const { accesstoken, refreshtoken } = await generateaccessandrefreshtokens(user._id);

  const safeUser = await User.findById(user._id).select("-password -refreshtoken");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(201)
    .cookie("accesstoken", accesstoken, cookieOptions)
    .cookie("refreshtoken", refreshtoken, cookieOptions)
    .json(new apiresponse(201, { user: safeUser }, "User Registered successfully"));
});

const loginuser = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apierror(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new apierror(404, "User is not found");
  }

  const passwordcorrect = await user.ispasswordcorrect(password);
  if (!passwordcorrect) {
    throw new apierror(401, "Password is Incorrect");
  }

  const { accesstoken, refreshtoken } = await generateaccessandrefreshtokens(user._id);
  const loggedinuser = await User.findById(user._id).select("-password -refreshtoken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(new apiresponse(200, { user: loggedinuser }, "user logged in successfully"));
});

const logoutuser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshtoken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new apiresponse(200, {}, "User Logged Out"));
});

const refreshaccesstoken=asynchandler(async(req,res)=>
    {
        const incomingrefreshtoken=req.cookies?.refreshtoken || req.body.refreshtoken

        if(!incomingrefreshtoken){
            throw new apierror(401,"Authorized request")
        }

        try {
            const decodedtoken=jwt.verify(
                incomingrefreshtoken,
                process.env.REFRESH_TOKEN_SECRET || "refresh_secret"
            )
    
           const user=await User.findById(decodedtoken?._id)
    
            if(!user){
                throw new apierror(401,"Invalid refresh token")
            }
    
            if(incomingrefreshtoken !== user?.refreshtoken){
                throw new apierror(401,"refresh token is expired or user")
            }
    
            const options={
                httpOnly:true,
                secure:true
            } 
            const {accesstoken,refreshtoken:newrefreshtoken}=await generateaccessandrefreshtokens(user._id)
            return res
            .status(200)
            .cookie("accesstoken",accesstoken,options)
            .cookie("refreshtoken",newrefreshtoken,options)
            .json(
                new apiresponse(200,
                    {accesstoken,refreshtoken:newrefreshtoken},
                    "access Token refreshed"
                )
            )
        } catch (error) {
            throw new apierror(401,error?.message || "Invalid refresh Token")
        }
    }
)

const changecurrentpassword=asynchandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body
    // console.log(req.body);
    
    const user=await User.findById(req.user?._id)
    console.log(user);
    const ispasswordcorrect =await user.ispasswordcorrect(oldpassword)
    console.log(ispasswordcorrect);

    if(!ispasswordcorrect){
        throw new apierror(400,"Invalid old password")
    }


    user.password=newpassword
    await user.save({validateBeforeSave: false})

    return res.status(200)
    .json(new apiresponse(200,{},"Password Change successfully"))
})

const getcuurentuser=asynchandler(async(req,res)=>{
    return res.status(200)
    .json(new apiresponse(200,req.user,"current user fetched successfully"))
})

const updateaccountdetails=asynchandler(async(req,res)=>{
    const{fullname,email,address,city,state,country,zip}=req.body

    if(!fullname || !email){
        throw new apierror(400,"Name and email are required")
    }

    // Combine address fields into a single string
    const fullAddress = [address, city, state, zip, country].filter(Boolean).join(', ');

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                name:fullname,
                email:email,
                address: fullAddress,
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiresponse(200,user,"Account details updated successfully"))
})

const updateProfile=asynchandler(async(req,res)=>{
    const{name,email,address,city,state,country,zip,phone_number}=req.body

    if(!name || !email){
        throw new apierror(400,"Name and email are required")
    }

    // Combine address fields into a single string
    const fullAddress = [address, city, state, zip, country].filter(Boolean).join(', ');

    let avatar_url = null;
    if (req.file?.path) {
        const cloudinaryResult = await uploadoncloudinary(req.file.path);
        if (!cloudinaryResult) throw new apierror(500, "Avatar upload failed");
        avatar_url = cloudinaryResult.secure_url;
    }
    console.log(avatar_url);

    const updateData = { 
        name, 
        email, 
        address: fullAddress,
        phone_number 
    };
    if (avatar_url) updateData.avatar_image_url = avatar_url;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        updateData,
        {new:true}
    ).select("-password")

    if (!user) throw new apierror(404, "User not found");

    return res
    .status(200)
    .json(new apiresponse(200,user,"Profile updated successfully"))
})

const updateuseravatar=asynchandler(async(req,res)=>{
    const avatarlocalpath=req.file?.path

    if(!avatarlocalpath){
        throw new apierror(400,"Avatar file is missing")
    }

    const avatar=await uploadoncloudinary(avatarlocalpath)

    if(!avatar.url){
        throw new apierror(400,"Error while uploading on avatar")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    res.status(200)
    .json(
        new apiresponse(200,user,"Avatar update successfully")
    )
})

const updateusercoverimage=asynchandler(async(req,res)=>{
    const coverimagelocalpath=req.file?.path

    if(!coverimagelocalpath){
        throw new apierror(400,"coverimage is not found")
    }

    const coverimage=await uploadoncloudinary(coverimagelocalpath)

    if(!coverimage.url){
        throw new apierror(400,"Error while uploading coverimage")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverimage:coverimage.url
        },
        {new:true}
    ).select("-password")

    
    res.status(200)
    .json(
        new apiresponse(200,user,"coverimage update successfully")
    )
})

const getuserprofile=asynchandler(async(req,res)=>{
    const{username}=req.params

    if(!username?.trim()){
        throw new apierror(400,"User name is missing")
    }

   const channel=await User.aggregate([
    {
        $match:{
            username:username?.toLowerCase()
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedto"
        }
    },
    {
        $addFields:{
            subscribercount:{
                $size:"$subscribers"
            },
            channelsubscribetocount:{
                $size:"$subscribedto"
            },
            issubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        }
    },
    {
        $project:{
            fullname:1,
            username:1,
            subscribercount:1,
            channelsubscribetocount:1,
            issubscribed:1,
            avatar:1,
            coverimage:1,
            emmail:1
        }
    }
   ])
   console.log(channel);
    
   if(!channel?.length){
        throw new apierror(404,"channel does not exists")
    }

    return res.status(200)
    .json(
        new apiresponse(200,channel[0],"User channel fetched successfully")
    )
})

const getwatchhistory=asynchandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchhistory",
                foreignField:"_id",
                as:"watchhistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                },
                                {
                                    $addFields:{
                                        owner:{
                                            $first:"$owner"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(new apiresponse(
        200,
        user[0].watchhistory,
        "Watch hisotry  fetch successfully"
    ))
})

export {registeruser,
    loginuser,
    logoutuser,
    refreshaccesstoken,
    changecurrentpassword,
    getcuurentuser,
    updateaccountdetails,
    updateProfile,
    updateuseravatar,
    updateusercoverimage,
    getuserprofile,
    getwatchhistory
} 
