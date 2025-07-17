export interface AuthPageProps {
  isSignIn?: boolean;
}

export interface FormData {
  name: string;
  email: string;
  password: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  errors?: FormErrors;
  data?: any;
}
