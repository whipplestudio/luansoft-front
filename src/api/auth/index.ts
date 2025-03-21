import axiosInstance from "../config"
import { apiCall } from "../../utils/api"

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  accessToken: string
  user: {
    id: string
    username: string
    email: string
  }
}

export const login = (credentials: LoginCredentials) =>
  apiCall<LoginResponse>(axiosInstance, "post", "/auth/login", credentials)

export const logout = () => apiCall<void>(axiosInstance, "post", "/auth/logout")

// Add more auth-related API calls as needed

