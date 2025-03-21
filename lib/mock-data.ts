import type {
  Contador,
  Client,
  Process,
  ClientType,
  TrafficLight,
  Notification,
  FiscalDeliverable,
  Document,
  HistoryEntry,
  User,
  Dashboard,
} from "@/types"
import { format, addDays, subDays } from "date-fns"

// Función auxiliar para generar fechas aleatorias
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

// Generar 50 usuarios
export const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `user${i + 1}`,
  name: `Usuario ${i + 1}`,
  email: `usuario${i + 1}@example.com`,
  avatar: `/avatars/avatar${(i % 10) + 1}.png`,
  role: ["admin", "contador", "dashboard", "cliente"][Math.floor(Math.random() * 4)] as
    | "admin"
    | "contador"
    | "dashboard"
    | "cliente",
  status: Math.random() > 0.1 ? "active" : "inactive",
  lastLogin: randomDate(new Date(2023, 0, 1), new Date()),
}))

// Generar 50 contadores
export const mockContadores: Contador[] = Array.from({ length: 50 }, (_, i) => ({
  id: `contador${i + 1}`,
  name: `Contador ${i + 1}`,
  email: `contador${i + 1}@example.com`,
  avatar: `/avatars/contador${(i % 10) + 1}.png`,
  role: "contador",
  status: Math.random() > 0.1 ? "active" : "inactive",
  lastLogin: randomDate(new Date(2023, 0, 1), new Date()),
  clients: [],
}))

// Generar 100 clientes y asignarlos a contadores
export const mockClients: Client[] = [
  {
    id: "1",
    name: "Empresa A",
    company: "Corporación XYZ",
    type: "Persona Moral", // Added type
    assignedTo: null,
    lastAssignedDate: null,
    status: "active", // Added status
    processes: [], // Added processes
  },
  {
    id: "2",
    name: "Juan Pérez",
    company: "Juan Pérez",
    type: "Persona Física", // Added type
    assignedTo: null,
    lastAssignedDate: null,
    status: "active", // Added status
    processes: [], // Added processes
  },
  {
    id: "3",
    name: "Empresa B",
    company: "Industrias ABC",
    type: "Persona Moral", // Added type
    assignedTo: null,
    lastAssignedDate: null,
    status: "active", // Added status
    processes: [], // Added processes
  },
  // Añade más clientes mock según sea necesario
  ...Array.from({ length: 97 }, (_, i) => {
    const assignedContador = mockContadores[Math.floor(Math.random() * mockContadores.length)]
    const client = {
      id: `client${i + 4}`,
      name: `Cliente ${i + 4}`,
      company: `Empresa ${i + 4}`,
      type: Math.random() > 0.5 ? "Persona Moral" : "Persona Física",
      assignedTo: assignedContador.id,
      status: Math.random() > 0.1 ? "active" : "inactive",
      processes: [],
    }
    assignedContador.clients.push(client.id)
    return client
  }),
]

// Generar procesos para cada cliente
const processNames = [
  "Declaración Anual",
  "Pago de IMSS",
  "Pago de nómina",
  "Carga de constancia",
  "Carga de opinión de cumplimiento",
  "Pago ante el SAT",
]
mockClients.forEach((client) => {
  client.processes = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => ({
    name: processNames[Math.floor(Math.random() * processNames.length)],
    status: ["completed", "in_progress", "pending"][Math.floor(Math.random() * 3)] as
      | "completed"
      | "in_progress"
      | "pending",
    progress: Math.floor(Math.random() * 101),
  }))
})

// Generar 50 tipos de cliente
export const mockClientTypes: ClientType[] = Array.from({ length: 50 }, (_, i) => ({
  id: `clientType${i + 1}`,
  name: `Tipo de Cliente ${i + 1}`,
  description: `Descripción del tipo de cliente ${i + 1}`,
  createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  totalClients: Math.floor(Math.random() * 50),
}))

// Generar 50 semáforos de tráfico
export const mockTrafficLights: TrafficLight[] = Array.from({ length: 50 }, (_, i) => ({
  id: `trafficLight${i + 1}`,
  clientName: mockClients[Math.floor(Math.random() * mockClients.length)].name,
  process: processNames[Math.floor(Math.random() * processNames.length)],
  dueDate: randomDate(new Date(), new Date(new Date().setFullYear(new Date().getFullYear() + 1))),
  progress: Math.floor(Math.random() * 101),
  status: ["on_time", "at_risk", "delayed"][Math.floor(Math.random() * 3)] as "on_time" | "at_risk" | "delayed",
  assignedTo: mockContadores[Math.floor(Math.random() * mockContadores.length)].name,
}))

// Generar 50 notificaciones
export const mockNotifications: Notification[] = Array.from({ length: 50 }, (_, i) => ({
  id: `notification${i + 1}`,
  title: `Notificación ${i + 1}`,
  description: `Descripción de la notificación ${i + 1}`,
  date: randomDate(new Date(2023, 0, 1), new Date()),
  read: Math.random() > 0.5,
}))

// Generar 50 entregables fiscales
//export const mockFiscalDeliverables: FiscalDeliverable[] = Array.from({ length: 50 }, (_, i) => ({
//  id: `fiscalDeliverable${i + 1}`,
//  client: mockClients[Math.floor(Math.random() * mockClients.length)].name,
//  deliverableType: ["Declaración Anual", "Declaración Mensual", "Comprobante de Pago de Impuestos"][
//    Math.floor(Math.random() * 3)
//  ],
//  period: ["Mensual", "Trimestral", "Anual"][Math.floor(Math.random() * 3)] as "Mensual" | "Trimestral" | "Anual",
//  dueDate: randomDate(new Date(), new Date(new Date().setFullYear(new Date().getFullYear() + 1))),
//  responsible: mockContadores[Math.floor(Math.random() * mockContadores.length)].name,
//  observations: `Observaciones para el entregable fiscal ${i + 1}`,
//  processes: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
//    name: processNames[Math.floor(Math.random() * processNames.length)],
//    status: ["completed", "in_progress", "pending"][Math.floor(Math.random() * 3)] as
//      | "completed"
//      | "in_progress"
//      | "pending",
//    progress: Math.floor(Math.random() * 101),
//  })),
//  progressPercentage: Math.floor(Math.random() * 101),
//}))

const generateRandomProcess = (): Process => {
  const processNames = [
    "Declaración Anual",
    "Pago de IMSS",
    "Pago de nómina",
    "Carga de constancia",
    "Carga de opinión de cumplimiento",
    "Pago ante el SAT",
  ]
  const statuses: ("completed" | "in_progress" | "pending")[] = ["completed", "in_progress", "pending"]
  return {
    name: processNames[Math.floor(Math.random() * processNames.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    progress: Math.floor(Math.random() * 101),
  }
}

const generateRandomDeliverable = (id: number): FiscalDeliverable => {
  const today = new Date()
  const clientNames = ["Empresa A", "Empresa B", "Empresa C", "Empresa D", "Empresa E"]
  const responsibleNames = [
    "Ana Rodríguez",
    "Carlos Gómez",
    "María López",
    "Juan Pérez",
    "Laura Martínez",
    "Pedro Sánchez",
    "Sofia García",
    "Diego Fernández",
    "Valentina Torres",
    "Alejandro Ruiz",
  ]
  const deliverableTypes = ["Declaración Anual", "Declaración Mensual", "Comprobante de Pago de Impuestos"]
  const periods: ("Mensual" | "Trimestral" | "Anual")[] = ["Mensual", "Trimestral", "Anual"]

  return {
    id: `fiscal${id}`,
    client: clientNames[Math.floor(Math.random() * clientNames.length)],
    deliverableType: deliverableTypes[Math.floor(Math.random() * deliverableTypes.length)],
    period: periods[Math.floor(Math.random() * periods.length)],
    dueDate: format(addDays(today, Math.floor(Math.random() * 60) - 30), "yyyy-MM-dd"),
    responsible: responsibleNames[Math.floor(Math.random() * responsibleNames.length)],
    observations: `Observaciones para el entregable fiscal ${id}`,
    processes: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, generateRandomProcess),
    progressPercentage: Math.floor(Math.random() * 101),
  }
}

export const mockFiscalDeliverables: FiscalDeliverable[] = Array.from({ length: 300 }, (_, i) =>
  generateRandomDeliverable(i + 1),
)

// Generar 50 documentos
export const mockDocuments: Document[] = Array.from({ length: 50 }, (_, i) => ({
  id: `document${i + 1}`,
  name: `Documento ${i + 1}.pdf`,
  uploadDate: randomDate(new Date(2023, 0, 1), new Date()),
  type: ["Factura", "Contrato", "Declaración", "Comprobante"][Math.floor(Math.random() * 4)],
  clientId: mockClients[Math.floor(Math.random() * mockClients.length)].id,
}))

// Generar 50 entradas de historial
export const mockHistoryEntries: HistoryEntry[] = Array.from({ length: 50 }, (_, i) => ({
  id: `historyEntry${i + 1}`,
  date: randomDate(new Date(2023, 0, 1), new Date()),
  responsibleName: mockContadores[Math.floor(Math.random() * mockContadores.length)].name,
  processes: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
    name: processNames[Math.floor(Math.random() * processNames.length)],
    status: Math.random() > 0.5 ? "completed" : "pending",
  })),
}))

// Generar 50 dashboards
export const mockDashboards: Dashboard[] = Array.from({ length: 50 }, (_, i) => ({
  id: `dashboard${i + 1}`,
  name: `Dashboard ${i + 1}`,
  description: `Descripción del dashboard ${i + 1}`,
  createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  lastUpdated: randomDate(new Date(2023, 0, 1), new Date()),
  owner: mockUsers[Math.floor(Math.random() * mockUsers.length)].name,
  widgets: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
    id: `widget${i}_${j}`,
    type: ["chart", "table", "kpi", "list"][Math.floor(Math.random() * 4)],
    title: `Widget ${j + 1}`,
    data: JSON.stringify({ sampleData: "Datos de ejemplo para el widget" }),
  })),
}))

