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

// Añadir el campo dueDate a la interfaz Process
export interface Process {
  id: string
  name: string
  description?: string
  status: string
  progress: number
  createdAt?: string
  updatedAt?: string
  dueDate?: string // Añadir campo para fecha de vencimiento
  deliveryStatus?: "onTime" | "atRisk" | "delayed" | "completed" // Añadir el campo deliveryStatus y el estado completed
  commitmentDate?: string
}

// Actualizo la interfaz Client para incluir el regimenFiscalId
export interface Client {
  id: string
  company: string
  type: "FISICA" | "MORAL"
  status: "ACTIVE" | "INACTIVE"
  regimenFiscalId: string
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
  isAssigned: boolean
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
