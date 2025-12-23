interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface ApiError {
  message: string;
  success: false;
  errors?: { field: string; message: string }[];
}

export type { ApiResponse, ApiError };
