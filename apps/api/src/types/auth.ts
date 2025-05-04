export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  errors?: ValidationError[];
  data?: {
    user: {
      id: string;
      email: string;
    };
    session: {
      access_token: string;
      refresh_token: string;
    };
  };
} 