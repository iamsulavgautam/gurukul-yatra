import express from "express";
import { getLoggedInUserData, registerUser, sendingOtpToEmail,  updatePushToken,  verifyingEmail,  verifyOtp } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticates";

const userRouter = express.Router();

userRouter.post("/registration", registerUser);

userRouter.post("/verify-otp", verifyOtp);

userRouter.post("/email-otp-request", sendingOtpToEmail);

userRouter.put("/email-otp-verify", verifyingEmail);

userRouter.get("/me", isAuthenticated, getLoggedInUserData);

userRouter.post('/user/update-push-token', updatePushToken);

export default userRouter;