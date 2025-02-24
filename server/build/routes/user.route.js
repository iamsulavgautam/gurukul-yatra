"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const isAuthenticates_1 = require("../middleware/isAuthenticates");
const userRouter = express_1.default.Router();
userRouter.post("/registration", user_controller_1.registerUser);
userRouter.post("/verify-otp", user_controller_1.verifyOtp);
userRouter.post("/email-otp-request", user_controller_1.sendingOtpToEmail);
userRouter.put("/email-otp-verify", user_controller_1.verifyingEmail);
userRouter.get("/me", isAuthenticates_1.isAuthenticated, user_controller_1.getLoggedInUserData);
userRouter.post('/user/update-push-token', user_controller_1.updatePushToken);
exports.default = userRouter;
