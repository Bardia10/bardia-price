// src/services/apiError.ts
export class ApiError extends Error {
  public status: number;
  public data: any;
  constructor(status: number, message?: string, data?: any) {
    super(message ?? `API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
