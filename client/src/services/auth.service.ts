import api from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from "@/types/auth.types";

export const authService = {
  login: (data: LoginInput) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),
  register: (data: RegisterInput) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get<ApiResponse<{ user: User }>>("/auth/me"),
  refresh: () =>
    api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh"),
  updateProfile: (name: string) =>
    api.put<ApiResponse<{ user: User }>>("/auth/profile", { name }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<ApiResponse<null>>("/auth/password", {
      currentPassword,
      newPassword,
    }),
};
