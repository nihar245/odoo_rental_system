import { Router } from "express";
import { registeruser,
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
    getwatchhistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

// Simplified JSON-based register (no file uploads)
router.route("/register").post(registeruser)

router.route("/login").post(loginuser)
    
router.route("/logout").post(verifyJWT,logoutuser)
router.route("/refresh-token").post(refreshaccesstoken)
// Keep the rest for now; frontend work only needs register/login/logout
router.route("/change-password").post(verifyJWT,changecurrentpassword),
router.route("/Current-user").get(verifyJWT,getcuurentuser),
router.route("/update-account").patch(verifyJWT,updateaccountdetails)
router.route("/update-profile").patch(verifyJWT,upload.single("avatar"),updateProfile)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateuseravatar),
router.route("/cover-image").patch(verifyJWT,upload.single("coverimage"),updateusercoverimage),
router.route("/c/:username").get(verifyJWT,getuserprofile)
router.route("/history").get(verifyJWT,getwatchhistory)

export default router