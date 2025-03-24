import axios from "axios"
import { setupInterceptors } from "./interceptors"

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://backend.lab.tupla.dev/api"

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
  },
})

setupInterceptors(axiosInstance)

export default axiosInstance

