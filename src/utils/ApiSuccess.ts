export class ApiSuccess {
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  constructor({
    message = "Success",
    data = null,
    statusCode = 200
  }: { message?: string; data?: any; statusCode?: number } = {}) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}