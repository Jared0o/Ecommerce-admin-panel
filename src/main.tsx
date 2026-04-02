import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"
import { refreshTokenApi } from "@/api/auth/auth"
import { setAccessToken } from "@/api/client"
import { router } from "@/router/index"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

async function bootstrap() {
  const refreshToken = localStorage.getItem("refreshToken")
  if (refreshToken) {
    try {
      const res = await refreshTokenApi({ refreshToken })
      setAccessToken(res.accessToken)
      localStorage.setItem("refreshToken", res.refreshToken)
    } catch {
      localStorage.removeItem("refreshToken")
    }
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </StrictMode>
  )
}

bootstrap()
