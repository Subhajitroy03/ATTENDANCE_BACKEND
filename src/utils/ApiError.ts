export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

interface ApiErrorOptions {
  code?: string;
  details?: ApiErrorDetail[];
}

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details: ApiErrorDetail[];

  constructor(
    statusCode:number = 400,
    message:string = 'Something went wrong',
    options?: ApiErrorOptions,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = options?.code || "API_ERROR";
    this.details = options?.details || [];
    Error.captureStackTrace(this, this.constructor);
  }
}
