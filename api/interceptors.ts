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
        const { data } = error.response as AxiosResponse
        if (Array.isArray(data.message)) {
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

