import type { RegimenFiscal } from "@/types"

export const mockRegimenesFiscales: RegimenFiscal[] = [
  {
    id: "1",
    nombre: "Régimen Simplificado de Confianza",
    descripcion: "Aplicable a personas físicas con ingresos de hasta 3.5 millones de pesos anuales.",
    status: "ACTIVE",
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: "2",
    nombre: "Régimen General de Ley",
    descripcion: "Aplicable a personas morales que realizan actividades empresariales.",
    status: "ACTIVE",
    createdAt: new Date(2023, 1, 20).toISOString(),
    updatedAt: new Date(2023, 1, 20).toISOString(),
  },
  {
    id: "3",
    nombre: "Régimen de Arrendamiento",
    descripcion: "Para personas físicas que obtienen ingresos por arrendar bienes inmuebles.",
    status: "ACTIVE",
    createdAt: new Date(2023, 2, 10).toISOString(),
    updatedAt: new Date(2023, 2, 10).toISOString(),
  },
  {
    id: "4",
    nombre: "Régimen de Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
    descripcion: "Aplicable a personas físicas y morales dedicadas a actividades primarias.",
    status: "INACTIVE",
    createdAt: new Date(2023, 3, 5).toISOString(),
    updatedAt: new Date(2023, 3, 5).toISOString(),
  },
  {
    id: "5",
    nombre: "Régimen de Incorporación Fiscal (RIF)",
    descripcion: "Régimen transitorio para pequeños contribuyentes.",
    status: "INACTIVE",
    createdAt: new Date(2023, 4, 12).toISOString(),
    updatedAt: new Date(2023, 4, 12).toISOString(),
  },
]
