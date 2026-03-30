import type { AdminPayload, StudentPayload, TeacherPayload, UserPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        destination: string;
        filename: string;
        path: string;
        size: number;
      }
    }

    interface Request {
      admin?: AdminPayload;
      user?: UserPayload;
      teacher?: TeacherPayload;
      student?: StudentPayload;
      rawBody?: Buffer;
      cookies?: Record<string, string>;
      signedCookies?: Record<string, string>;
      files?: Record<string, Multer.File[]> | Multer.File[];
      file?: Multer.File;
    }
  }
}

export {};
