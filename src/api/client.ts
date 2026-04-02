import axios from "axios"
import type { InternalAxiosRequestConfig } from "axios"

export interface ApiError {
  type: string
  message: string
  errors?: { propertyName: string; errorMessage: string }[]
}

let accessToken: string | null = null
let refreshPromise: Promise<string> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const is401 =
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/")

    if (is401) {
      original._retry = true

      const storedRefreshToken = localStorage.getItem("refreshToken")
      if (!storedRefreshToken) {
        setAccessToken(null)
        window.location.href = "/login"
        return Promise.reject(buildApiError(error))
      }

      if (!refreshPromise) {
        refreshPromise = (async () => {
          const { refreshTokenApi } = await import("@/api/auth/auth")
          const res = await refreshTokenApi({ refreshToken: storedRefreshToken })
          setAccessToken(res.accessToken)
          localStorage.setItem("refreshToken", res.refreshToken)
          return res.accessToken
        })()
          .catch((err) => {
            setAccessToken(null)
            localStorage.removeItem("refreshToken")
            window.location.href = "/login"
            return Promise.reject(err)
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      try {
        const newToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      } catch {
        return Promise.reject(buildApiError(error))
      }
    }

    return Promise.reject(buildApiError(error))
  }
)

function buildApiError(error: unknown): ApiError {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data
  ) {
    return error.response.data as ApiError
  }
  return { type: "UnknownError", message: "Wystąpił nieoczekiwany błąd." }
}
