import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import {
  loginApi,
  revokeTokenApi,
  type LoginRequest,
} from "@/api/auth/auth"
import { setAccessToken, getAccessToken } from "@/api/client"

export function useLogin() {
  const router = useRouter()
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      router.navigate({ to: "/admin/dashboard" })
    },
  })
}

export function useLogout() {
  const router = useRouter()
  return async () => {
    const refreshToken = localStorage.getItem("refreshToken")
    if (refreshToken) {
      try {
        await revokeTokenApi({ refreshToken })
      } catch {
        // ignore revoke errors
      }
    }
    setAccessToken(null)
    localStorage.removeItem("refreshToken")
    router.navigate({ to: "/login" })
  }
}

export function useIsAuthenticated(): boolean {
  return getAccessToken() !== null
}

export type { LoginRequest }
