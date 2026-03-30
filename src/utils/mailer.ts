import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Helper to convert environment string values to boolean
 */
const parseBoolean = (value: string | undefined, fallback = false): boolean => {
    if (value === undefined) {
        return fallback;
    }
    return value.toLowerCase() === "true";
};

/**
 * Creates and returns a Nodemailer transporter based on .env configuration
 */
export const createTransporter = () => {
    const email = process.env.NODEMAILER_EMAIL;
    const password = process.env.NODEMAILER_PASSWORD;

    if (!email || !password) {
        throw new Error("Email credentials (NODEMAILER_EMAIL or NODEMAILER_PASSWORD) not configured");
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    
    // Logic for secure/TLS settings
    const secure = parseBoolean(process.env.SMTP_SECURE, port === 465);
    
    // Logic for handling self-signed certificate errors
    // If SMTP_ALLOW_SELF_SIGNED_CERTS is true, rejectUnauthorized becomes false
    const allowSelfSigned = parseBoolean(
        process.env.SMTP_ALLOW_SELF_SIGNED_CERTS,
        process.env.NODE_ENV !== "production"
    );

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user: email,
            pass: password,
        },
        tls: {
            // FIX: This bypasses the 'self-signed certificate in certificate chain' error 
            // when allowSelfSigned is true.
            rejectUnauthorized: !allowSelfSigned,
            
            // Adding servername helps resolve SNI (Server Name Indication) issues 
            // where the certificate host doesn't match the connection host.
            servername: host,
        },
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 30000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 30000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 30000),
    });
};