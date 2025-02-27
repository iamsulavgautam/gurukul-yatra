"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoggedInUserData = exports.verifyingEmail = exports.sendingOtpToEmail = exports.verifyOtp = exports.registerUser = exports.updatePushToken = exports.Test = void 0;
require("dotenv").config();
const twilio_1 = __importDefault(require("twilio"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../app");
const send_token_1 = require("../utils/send-token");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = (0, twilio_1.default)(accountSid, authToken, {
    lazyLoading: true,
});
const serviceSid = process.env.TWILIO_SERVICE_SID;
const formatPhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    if (!phone.startsWith("+")) {
        phone = `+${phone}`;
    }
    return phoneRegex.test(phone) ? phone : null;
};
// Test
const Test = async (req, res) => {
    res.status(200).json({ message: "API is working" });
    console.log("Api test ok");
};
exports.Test = Test;
const updatePushToken = async (req, res) => {
    try {
        const { userId, pushToken } = req.body;
        if (!userId || !pushToken) {
            return res.status(400).json({
                success: false,
                message: "User ID and push token are required",
            });
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: { pushNotificationId: pushToken },
        });
        res.status(200).json({
            success: true,
            message: "Push notification token updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating push token:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update push notification token",
            error,
        });
    }
};
exports.updatePushToken = updatePushToken;
const registerUser = async (req, res) => {
    try {
        let { phone_number } = req.body;
        phone_number = formatPhoneNumber(phone_number);
        if (!phone_number) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format. Use E.164 format (e.g., +977XXXXXXXXXX)",
            });
        }
        try {
            await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                channel: "sms",
                to: phone_number,
            });
            res.status(201).json({
                success: true,
                message: "OTP sent successfully!",
            });
        }
        catch (error) {
            console.error("Twilio Error:", error);
            res.status(400).json({
                success: false,
                message: "Failed to send OTP. Please check your Twilio settings.",
                error,
            });
        }
    }
    catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.registerUser = registerUser;
const verifyOtp = async (req, res, next) => {
    try {
        const { phone_number, otp } = req.body;
        try {
            await client.verify.v2
                .services(process.env.TWILIO_SERVICE_SID)
                .verificationChecks.create({
                to: phone_number,
                code: otp,
            });
            const isUserExist = await prisma_1.default.user.findUnique({
                where: {
                    phone_number,
                },
            });
            if (isUserExist) {
                await (0, send_token_1.sendToken)(isUserExist, res);
            }
            else {
                const user = await prisma_1.default.user.create({
                    data: {
                        phone_number: phone_number,
                    },
                });
                res.status(200).json({
                    success: true,
                    message: "OTP verified successfully!",
                    user: user,
                });
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).json({
                success: false,
                message: "Something went wrong!",
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
        });
    }
};
exports.verifyOtp = verifyOtp;
const sendingOtpToEmail = async (req, res, next) => {
    try {
        const { email, name, userId } = req.body;
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const user = {
            userId,
            name,
            email,
        };
        const token = jsonwebtoken_1.default.sign({
            user,
            otp,
        }, process.env.EMAIL_ACTIVATION_SECRET, {
            expiresIn: "5m",
        });
        try {
            await app_1.nylas.messages.send({
                identifier: process.env.USER_GRANT_ID,
                requestBody: {
                    to: [{ name: name, email: email }],
                    subject: "Verify your email address!",
                    body: `
          <p>Hi ${name},</p>
          <p>Your Gurukul Yatra code is ${otp}. If you didn't request for this OTP, please ignore this email!</p>
          <p>Thanks,<br>Gurukul Yatra Team</p>
          `,
                },
            });
            res.status(201).json({
                success: true,
                token,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            console.log(error);
        }
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendingOtpToEmail = sendingOtpToEmail;
const verifyingEmail = async (req, res, next) => {
    try {
        const { otp, token } = req.body;
        // Verify JWT first
        const decoded = jsonwebtoken_1.default.verify(token, process.env.EMAIL_ACTIVATION_SECRET);
        // Check user existence
        const existingUser = await prisma_1.default.user.findUnique({
            where: { id: decoded.user.userId }
        });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Validate OTP
        if (decoded.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }
        // Check if email already verified
        if (existingUser.email) {
            return res.status(400).json({
                success: false,
                message: "Email already verified",
            });
        }
        // Update user data
        const updatedUser = await prisma_1.default.user.update({
            where: { id: existingUser.id },
            data: {
                name: decoded.user.name,
                email: decoded.user.email,
            },
        });
        // Send final response
        await (0, send_token_1.sendToken)(updatedUser, res);
    }
    catch (error) {
        console.error("Email verification error:", error);
        // Handle specific JWT errors
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Verification token expired",
            });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid verification token",
            });
        }
        // Generic error response
        res.status(500).json({
            success: false,
            message: "Email verification failed",
        });
    }
};
exports.verifyingEmail = verifyingEmail;
const getLoggedInUserData = async (req, res) => {
    try {
        const user = req.user;
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.getLoggedInUserData = getLoggedInUserData;
