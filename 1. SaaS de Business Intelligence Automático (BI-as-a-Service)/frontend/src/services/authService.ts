import api from './api';
import type { LoginCredentials, RegisterData, User, AuthTokens } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout/', { refresh_token: refreshToken });
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/update_profile/', data);
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string, newPasswordConfirm: string): Promise<void> {
    await api.post('/users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/password-reset/', { email });
  },

  async confirmPasswordReset(token: string, newPassword: string, newPasswordConfirm: string): Promise<void> {
    await api.post('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
  },
};
