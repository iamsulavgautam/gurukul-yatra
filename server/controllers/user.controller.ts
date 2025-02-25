require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import twilio from "twilio";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { nylas } from "../app";
import { sendToken } from "../utils/send-token";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken, {
  lazyLoading: true,
});
const serviceSid = process.env.TWILIO_SERVICE_SID!;

const formatPhoneNumber = (phone: string): string | null => {
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  if (!phone.startsWith("+")) {
    phone = `+${phone}`;
  }
  return phoneRegex.test(phone) ? phone : null;
};

// Test
export const Test = async (req: Request, res: Response) => {
  res.status(200).json({ message: "API is working" });
  console.log("Api test ok")
};

export const updatePushToken = async (req: Request, res: Response) => {
  try {
    const { userId, pushToken } = req.body;

    if (!userId || !pushToken) {
      return res.status(400).json({
        success: false,
        message: "User ID and push token are required",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { pushNotificationId: pushToken },
    });

    res.status(200).json({
      success: true,
      message: "Push notification token updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating push token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update push notification token",
      error,
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
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
        .services(serviceSid!)
        .verifications.create({
          channel: "sms",
          to: phone_number,
        });

      res.status(201).json({
        success: true,
        message: "OTP sent successfully!",
      });
    } catch (error) {
      console.error("Twilio Error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to send OTP. Please check your Twilio settings.",
        error,
      });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone_number, otp } = req.body;

    try {
      await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID!)
        .verificationChecks.create({
          to: phone_number,
          code: otp,
        });

      const isUserExist = await prisma.user.findUnique({
        where: {
          phone_number,
        },
      });

      if (isUserExist) {
        await sendToken(isUserExist, res);
      } else {
        const user = await prisma.user.create({
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
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
    });
  }
};

export const sendingOtpToEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, userId } = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const user = {
      userId,
      name,
      email,
    };
    const token = jwt.sign(
      {
        user,
        otp,
      },
      process.env.EMAIL_ACTIVATION_SECRET!,
      {
        expiresIn: "5m",
      }
    );
    try {
      await nylas.messages.send({
        identifier: process.env.USER_GRANT_ID!,
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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};

export const verifyingEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp, token } = req.body;

    // Verify JWT first
    const decoded: any = jwt.verify(token, process.env.EMAIL_ACTIVATION_SECRET!);

    // Check user existence
    const existingUser = await prisma.user.findUnique({
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
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: decoded.user.name,
        email: decoded.user.email,
      },
    });

    // Send final response
    await sendToken(updatedUser, res);

  } catch (error) {
    console.error("Email verification error:", error);
    
    // Handle specific JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Verification token expired",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
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

export const getLoggedInUserData = async (req: any, res: Response) => {
  try {
    const user = req.user;

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};