import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config();

let isConfigured = false;

const ensureCloudinaryConfigured = (): void => {
    if (isConfigured) {
        return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new ApiError(500, "Cloudinary env variables missing");
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    isConfigured = true;
};

const getCloudinaryErrorMessage = (err: unknown): string => {
    if (err instanceof Error && err.message) {
        return err.message;
    }

    if (typeof err === "object" && err !== null) {
        const maybeMessage = (err as { message?: unknown }).message;
        if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
            return maybeMessage;
        }

        const nestedError = (err as { error?: { message?: unknown } }).error;
        if (nestedError && typeof nestedError.message === "string" && nestedError.message.trim().length > 0) {
            return nestedError.message;
        }
    }

    return "Cloudinary upload failed";
};

export const uploadOnCloudinary = async (localFilePath: string): Promise<string> => {
    try {
        ensureCloudinaryConfigured();

        if (!localFilePath) {
            throw new ApiError(400, "Invalid path");
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        return response.secure_url || response.url;
    } catch (err) {
        const message = getCloudinaryErrorMessage(err);
        throw new ApiError(500, message);
    }
};