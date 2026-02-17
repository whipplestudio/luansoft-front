import { axiosInstance } from "@/lib/axios"
import type { ClienteFinancialData } from "@/types/financial"

export type { ClienteFinancialData } from "@/types/financial"

export interface FinancialDataResponse {
  success: boolean
  message: string
  errorCode: null | string
  data: ClienteFinancialData[]
}

export interface UploadFinancialDataResponse {
  message: string
  success: boolean
  clientId: string
  filesProcessed: number
}

/**
 * Sube PDFs financieros y los procesa
 */
export async function uploadFinancialData(
  clientId: string,
  files: File[]
): Promise<UploadFinancialDataResponse> {
  const formData = new FormData()
  formData.append("clientId", clientId)
  
  files.forEach((file) => {
    formData.append("files", file)
  })

  const response = await axiosInstance.post<UploadFinancialDataResponse>(
    "/financial-data/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )

  return response.data
}

/**
 * Obtiene datos financieros de un cliente
 */
export async function getFinancialData(
  clienteId: string,
  year?: string
): Promise<ClienteFinancialData | null> {
  const params: any = { clienteId }
  if (year) {
    params.year = year
  }

  const response = await axiosInstance.get<FinancialDataResponse>(
    "/financial-data",
    { params }
  )

  if (response.data.success && response.data.data.length > 0) {
    return response.data.data[0]
  }

  return null
}

/**
 * Obtiene el nombre del mes en español
 */
export function getMonthName(monthStr: string): string {
  const [, month] = monthStr.split("-")
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  return monthNames[parseInt(month) - 1] || "Desconocido"
}
