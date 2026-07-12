export class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data: T;

  constructor(data: T, message: string = 'Success') {
    this.success = true;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message: string = 'Success') {
    return new ApiResponse(data, message);
  }
}
export default ApiResponse;
