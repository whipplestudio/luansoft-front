"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { HistoryEntry } from "@/types"
import { mockHistoryEntries } from "@/lib/mock-data"

const columns: ColumnDef<HistoryEntry>[] = [
  {
    accessorKey: "date",
    header: "Fecha",
  },
  {
    accessorKey: "responsibleName",
    header: "Responsable",
  },
  {
    accessorKey: "processes",
    header: "Procesos",
    cell: ({ row }) => (
      <div>
        {row.original.processes.map((process, index) => (
          <div key={index}>
            {process.name}: {process.status === "completed" ? "Completado" : "Pendiente"}
          </div>
        ))}
      </div>
    ),
  },
]

export default function HistorialPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role)

    if (role !== "cliente") {
      router.push("/")
    }
  }, [router])

  if (userRole !== "cliente") {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Historial de la Empresa</h1>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Procesos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={mockHistoryEntries} />
        </CardContent>
      </Card>
    </div>
  )
}

