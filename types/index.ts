export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "contador" | "dashboard" | "cliente"
  status: "active" | "inactive"
  lastLogin: string
}

export interface Contador extends User {
  role: "contador"
  clients: string[] // Array of client IDs
}

// Añadir el campo dueDate a la interfaz Process
export interface Process {
  id: string
  name: string
  description?: string
  status?: string
  progress: number
  createdAt?: string
  updatedAt?: string
  dueDate?: string // Añadir campo para fecha de vencimiento
  deliveryStatus?: "onTime" | "atRisk" | "delayed" // Añadir el campo deliveryStatus
}

// Actualizo la interfaz Client para incluir el regimenFiscalId
export interface Client {
  id: string
  name: string
  company: string
  razonSocial: string
  type: string
  assignedTo: string | null // ID of the assigned contador or null if unassigned
  status: "active" | "inactive" | "ACTIVE" | "INACTIVE"
  processes: Process[]
  lastAssignedDate: string | null // Date string of last assignment
  email?: string // Añadir campo email
  regimenFiscalId?: string // Añadir campo regimenFiscalId
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

export interface FiscalDeliverable {
  id: string
  client: string
  deliverableType: string
  period: "Mensual" | "Trimestral" | "Anual"
  dueDate: string
  responsible: string
  observations: string
  processes: Process[]
  progressPercentage: number
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
export interface ProcessAssignment {
  id: string
  clientId: string
  processId: string
  commitmentDate: string
  process: Process
  status?: "ACTIVE" | "INACTIVE" | "PAID"
  graceDays?: number
  payrollFrequencies?: string[] // Añadir el campo payrollFrequencies
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

