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
    // Brak config = błąd sieciowy, nie HTTP — przepuść dalej
    if (!error.config) {
      return Promise.reject(buildApiError(error))
    }

    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const isAuthEndpoint = !!original.url?.includes("/auth/")
    const is401 = error.response?.status === 401 && !original._retry && !isAuthEndpoint

    if (!is401) {
      return Promise.reject(buildApiError(error))
    }

    original._retry = true

    // Jeśli nie ma refresh tokenu — od razu wyloguj
    const storedRefreshToken = localStorage.getItem("refreshToken")
    if (!storedRefreshToken) {
      redirectToLogin()
      return Promise.reject(buildApiError(error))
    }

    // Serializacja — jeden refresh na raz, reszta czeka
    if (!refreshPromise) {
      refreshPromise = doRefresh(storedRefreshToken).finally(() => {
        refreshPromise = null
      })
    }

    try {
      await refreshPromise
      // Nowy token zostanie ustawiony przez request interceptor
      return apiClient(original)
    } catch {
      // Refresh się nie udał — token w localStorage już wyczyszczony w doRefresh
      redirectToLogin()
      return Promise.reject(buildApiError(error))
    }
  }
)

async function doRefresh(storedRefreshToken: string): Promise<string> {
  try {
    const { refreshTokenApi } = await import("@/api/auth/auth")
    const res = await refreshTokenApi({ token: storedRefreshToken })
    setAccessToken(res.accessToken)
    localStorage.setItem("refreshToken", res.refreshToken)
    return res.accessToken
  } catch (err) {
    setAccessToken(null)
    localStorage.removeItem("refreshToken")
    throw err
  }
}

function redirectToLogin() {
  setAccessToken(null)
  localStorage.removeItem("refreshToken")
  // setTimeout żeby nie przerywać aktywnych promise-chain
  setTimeout(() => {
    window.location.href = "/login"
  }, 0)
}

function buildApiError(error: unknown): ApiError {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "type" in (error.response.data as object)
  ) {
    return error.response.data as ApiError
  }
  return { type: "UnknownError", message: "Wystąpił nieoczekiwany błąd." }
}
