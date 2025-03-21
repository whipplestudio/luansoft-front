import type { Process } from "@/types"

// Datos mock para procesos
export const mockProcesses: Process[] = [
  {
    id: "proc-1",
    name: "Facturación",
    description: "Proceso mensual de facturación",
    status: "active",
    progress: 0,
  },
  {
    id: "proc-2",
    name: "Impuestos SAT",
    description: "Declaración de impuestos ante el SAT",
    status: "active",
    progress: 0,
  },
  {
    id: "proc-3",
    name: "Declaración Anual",
    description: "Proceso anual de declaración de impuestos",
    status: "active",
    progress: 0,
  },
  {
    id: "proc-4",
    name: "DIOT",
    description: "Declaración Informativa de Operaciones con Terceros",
    status: "active",
    progress: 0,
  },
  {
    id: "proc-5",
    name: "Nómina",
    description: "Proceso quincenal de nómina",
    status: "active",
    progress: 0,
  },
]

// Datos mock para asignaciones de procesos a clientes
export const mockProcessAssignments: {
  id: string
  clientId: string
  processId: string
  commitmentDate: string
}[] = []

