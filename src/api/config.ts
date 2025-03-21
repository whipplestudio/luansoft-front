import axios from "axios"
import { setupInterceptors } from "./interceptors" // This line was correct, no change needed

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://eb06-2806-269-481-1b11-1825-75f-c800-8c74/api.ngrok-free.app/api"

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
  },
})

setupInterceptors(axiosInstance)

export default axiosInstance

