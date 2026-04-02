import { apiClient } from "@/api/client"

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshRequest {
  refreshToken: string
}

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/login", data)
  return res.data
}

export async function refreshTokenApi(
  data: RefreshRequest
): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/refresh", data)
  return res.data
}

export async function revokeTokenApi(data: RefreshRequest): Promise<void> {
  await apiClient.post("/auth/revoke", data)
}
