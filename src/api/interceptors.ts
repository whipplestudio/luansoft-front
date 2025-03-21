import type { AxiosError, AxiosInstance, AxiosResponse } from "axios"
import { toast } from "sonner"

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response.data.success && response.data.message) {
        toast.success(response.data.message)
      }
      return response
    },
    (error: AxiosError) => {
      if (error.response) {
        const { data, status } = error.response as AxiosResponse
        if (status === 401) {
          // Error de autenticación
          localStorage.removeItem("isAuthenticated")
          localStorage.removeItem("userRole")
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          window.location.href = "/login"
          toast.error("Sesión expirada. Por favor, inicie sesión nuevamente.")
        } else if (Array.isArray(data.message)) {
          data.message.forEach((msg: string) => toast.error(msg))
        } else {
          toast.error(data.message || "An error occurred")
        }
      } else {
        toast.error("Network error. Please try again.")
      }
      return Promise.reject(error)
    },
  )
}

