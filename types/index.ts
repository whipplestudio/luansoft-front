// Actualizar la interfaz User para cambiar "cliente" por "contacto" en el tipo role
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "contador" | "dashboard" | "contacto"
  status: "active" | "inactive"
  lastLogin: string
}

export interface Contador extends User {
  role: "contador"
  clients: string[] // Array of client IDs
  clientCount?: number // Número de clientes asignados
  clientDetails?: any[] // Detalles completos de los clientes
}

// Añadir la interfaz FileInfo para representar la información del archivo
export interface FileInfo {
  id: string
  originalName: string
  url: string
  type: string
}

// Actualizar la interfaz Process para incluir la propiedad file
export interface Process {
  id: string
  name: string
  description?: string
  status: string
  progress: number
  graceDays: number
  createdAt?: string
  updatedAt?: string
  dueDate?: string // Añadir campo para fecha de vencimiento
  deliveryStatus?: "onTime" | "atRisk" | "delayed" | "completed" // Añadir el campo deliveryStatus y el estado completed
  commitmentDate?: string
  file?: FileInfo
}

// Tax indicator status type
export type TaxIndicatorStatus = "green" | "yellow" | "red" | "gray"

// Contalink file interface
export interface ContalinkFile {
  numeroOperacion: string
  lineaCaptura: string
  tipoDeclaracion: string
  tipoComplementaria: string
  fechaPresentacion: string
  tipoDocumento: string
  periodo: string
  filePath: string
  downloadUrl: string
}

// Tax indicator interface
export interface TaxIndicator {
  id: string
  name: string
  shortName: string
  status: TaxIndicatorStatus
  dueDate?: string
  fileId?: string
  files?: ContalinkFile[] // Archivos de Contalink para obligaciones verdes
}

// Monthly report interface
export interface MonthlyReport {
  id: string
  month: string
  year: number
  date: string
  clientId: string
}

// Actualizo la interfaz Client para incluir el regimenFiscalId
export interface Client {
  id: string
  company: string
  type: "FISICA" | "MORAL"
  status: "ACTIVE" | "INACTIVE"
  regimenFiscalId: string
  rfc?: string | null
  isContractSigned?: boolean
  contractFile?: {
    id: string
    originalName: string
    url: string
    thumbnailUrl: string | null
    type: string
    bucket: string
    folder: string
    size: number
    clientContractId: string
    createdAt: string
    updatedAt: string
  } | null
  contador: {
    id: string
    name: string
    email: string
  } | null
  contacto: {
    id: string
    name: string
    email: string
    phone: string | null
  } | null
  regimenFiscal:
    | {
        id: string
        nombre: string
        descripcion: string
      }
    | string
  isAssigned?: boolean
  taxIndicators?: TaxIndicator[]
  monthlyReports?: MonthlyReport[]
  createdAt: string
  updatedAt: string
}

// Nueva interfaz para Contacto
export interface Contacto {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  status: "ACTIVE" | "INACTIVE"
  clientId?: string
  client?: {
    id: string
    company: string
  }
  createdAt: string
  updatedAt: string
}

export interface ClientType {
  id: string
  name: string
  description: string
  createdAt: string
  totalClients: number
}

export type ProcessStatus = "pending" | "in_progress" | "completed"

export interface TrafficLight {
  id: string
  clientName: string
  process: string
  dueDate: string
  progress: number
  status: "on_time" | "at_risk" | "delayed"
  assignedTo: string
}

export interface Notification {
  id: string
  title: string
  description: string
  date: string
  read: boolean
}

export type SemaphoreStatus = "green" | "yellow" | "red"

// Actualizar la interfaz ApiClient para incluir la información del archivo en los procesos
export interface ApiClient {
  id: string
  company: string
  contador: {
    id: string
    email: string
    firstName: string
    lastName: string
    status: string
  } | null
  contacto: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string | null
    status: string
  }
  processes: {
    id: string
    name: string
    commitmentDate: string
    status: string
    deliveryStatus: "onTime" | "atRisk" | "delayed" | "completed"
    graceDays: number
    file?: {
      id: string
      originalName: string
      url: string
      type: string
    }
  }[]
  completionPercentage: string
}
export interface FiscalDeliverable {
  id: string
  client: string
  company: string // Add the company property
  deliverableType: string
  period: string
  dueDate: string
  responsible: string
  observations: string
  processes: Process[]
  progressPercentage: number
  originalData: ApiClient
}

export interface Document {
  id: string
  name: string
  uploadDate: string
  type: string
  clientId: string
}

export interface HistoryEntry {
  id: string
  date: string
  responsibleName: string
  processes: {
    name: string
    status: "completed" | "pending"
  }[]
}

// Actualizo la interfaz ProcessAssignment para incluir payrollFrequencies
// Buscar la definición de ProcessAssignment y reemplazarla con esta versión actualizada

// Con esta versión actualizada:
// Actualizar la interfaz ProcessAssignment para incluir el campo paymentPeriod
export interface ProcessAssignment {
  id: string
  clientId: string
  processId: string
  commitmentDate: string
  process: Process
  status?: "ACTIVE" | "INACTIVE" | "PAID"
  graceDays?: number
  payrollFrequencies?: string[] // Añadir el campo payrollFrequencies
  paymentPeriod?: "MONTHLY" | "ANNUAL" // Añadir el campo paymentPeriod
}

export interface Dashboard {
  id: string
  name: string
  description: string
  createdAt: string
  lastUpdated: string
  owner: string
  widgets: {
    id: string
    type: string
    title: string
    data: string
  }[]
}

// Add the RegimenFiscal interface after the existing interfaces

export interface RegimenFiscal {
  id: string
  nombre: string
  descripcion: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  updatedAt: string
}
