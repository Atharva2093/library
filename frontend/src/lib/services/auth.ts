import api from '../api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  User,
} from '../types';

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // OAuth2 form data expects 'username' field but backend will use it as email
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response;
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/auth/register', userData);
    return response;
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response;
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/me', userData);
    return response;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  // Request password reset
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await api.post('/auth/forgot-password', data);
  }

  // Confirm password reset
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    await api.post('/auth/reset-password', data);
  }

  // Refresh token
  async refreshToken(): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/refresh');
    return response;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Always remove token from storage, even if API call fails
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('access_token');
      }
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    await api.post(`/auth/verify-email/${token}`);
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification');
  }
}

export default new AuthService();
