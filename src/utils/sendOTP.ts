import dotenv from "dotenv";
dotenv.config();

import { createTransporter } from "./mailer.js";
import { logger } from "../config/logger.js";

interface OtpEmail {
    email: string;
    otp: string;
}


export const sendOtpEmail = async ({
    email,
    otp
}: OtpEmail): Promise<void> => {
    try {
        const transporter = createTransporter();
        const htmlBody = otpEmailTemplate(otp);
        const fallbackText = `Your OTP is: ${otp}

This OTP is valid for a limited time. Do not share it with anyone.

If you did not request this, please ignore this email.`;

        await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Your OTP Code",
            text: fallbackText,
            html: htmlBody,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown mail error";
        logger.error(`OTP Email Error: ${message}`);
        throw new Error("Failed to send OTP email");
    }
};

/**
 * OTP Email HTML Template
 */
const otpEmailTemplate = (otp: string): string => {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; text-align: center;">
            
            <h2 style="color: #333;">Verification Code</h2>
            
            <p style="color: #555; font-size: 14px;">
                Use the following OTP to proceed:
            </p>

            <div style="margin: 20px 0;">
                <span style="
                    display: inline-block;
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 6px;
                    color: #2c3e50;
                    background: #ecf0f1;
                    padding: 12px 20px;
                    border-radius: 6px;
                ">
                    ${otp}
                </span>
            </div>

            <p style="color: #777; font-size: 13px;">
                This OTP is valid for a short time. Do not share it with anyone.
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 20px;">
                If you didn’t request this, you can safely ignore this email.
            </p>

        </div>
    </div>
    `;
};