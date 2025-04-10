import { axiosInstance } from "@/lib/axios"

export interface RegimenFiscalResponse {
  success: boolean
  message: string
  errorCode: null | string
  data: {
    data: Array<{
      id: string
      nombre: string
      descripcion: string
      status: "ACTIVE" | "INACTIVE"
      createdAt: string
      updatedAt: string
    }>
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface RegimenFiscalActiveResponse {
  success: boolean
  message: string
  errorCode: null | string
  data: Array<{
    id: string
    nombre: string
    descripcion: string
    status: "ACTIVE"
    createdAt: string
    updatedAt: string
  }>
}

export interface RegimenFiscalCreateUpdateDto {
  nombre?: string
  descripcion?: string
}

export const getRegimenesFiscales = async (page = 1, limit = 10, filter = "") => {
  try {
    const response = await axiosInstance.get<RegimenFiscalResponse>(
      `/regimenfiscal?page=${page}&limit=${limit}${filter ? `&filter=${filter}` : ""}`,
    )
    return response.data
  } catch (error) {
    console.error("Error fetching regimenes fiscales:", error)
    throw error
  }
}

export const getActiveRegimenesFiscales = async () => {
  try {
    const response = await axiosInstance.get<RegimenFiscalActiveResponse>(`/regimenfiscal/activos`)
    return response.data
  } catch (error) {
    console.error("Error fetching active regimenes fiscales:", error)
    throw error
  }
}

export const createRegimenFiscal = async (data: RegimenFiscalCreateUpdateDto) => {
  try {
    const response = await axiosInstance.post<RegimenFiscalResponse>(`/regimenfiscal`, data)
    return response.data
  } catch (error) {
    console.error("Error creating regimen fiscal:", error)
    throw error
  }
}

export const updateRegimenFiscal = async (id: string, data: RegimenFiscalCreateUpdateDto) => {
  try {
    const response = await axiosInstance.patch<RegimenFiscalResponse>(`/regimenfiscal/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Error updating regimen fiscal:", error)
    throw error
  }
}

export const deleteRegimenFiscal = async (id: string) => {
  try {
    const response = await axiosInstance.delete<RegimenFiscalResponse>(`/regimenfiscal/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting regimen fiscal:", error)
    throw error
  }
}

export const activateRegimenFiscal = async (id: string) => {
  try {
    const response = await axiosInstance.patch<RegimenFiscalResponse>(`/regimenfiscal/${id}/activate`)
    return response.data
  } catch (error) {
    console.error("Error activating regimen fiscal:", error)
    throw error
  }
}
