"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Process } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProcessForm } from "@/components/ProcessForm"
import { Toaster, toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { debounce } from "@/utils/debounce"
import axiosInstance from "@/api/config"

export default function ProcesosPage() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")

  const fetchProcesses = useCallback(async (page = 1, limit = 10, name = "") => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.get("/process", {
        params: {
          page,
          limit,
          name: name || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        const { data, total, page: currentPage, limit: pageLimit, totalPages } = response.data.data

        // Mapear los datos para incluir progress si no existe
        const mappedProcesses = data.map((process: Process) => ({
          ...process,
          progress: process.progress || 0,
        }))

        setProcesses(mappedProcesses)
        setPagination({
          page: currentPage,
          limit: pageLimit,
          total,
          totalPages,
        })
      } else {
        throw new Error(response.data.message || "Error fetching processes")
      }
    } catch (error) {
      console.error("Error fetching processes:", error)
      toast.error("Error al cargar los procesos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      // Siempre enviar página 1 cuando se filtra
      setPagination((prev) => ({ ...prev, page: 1 }))
      fetchProcesses(1, pagination.limit, value)
    }, 3000),
    [fetchProcesses, pagination.limit],
  )

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setSearchTerm(value)
    debouncedSearch(value)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
    fetchProcesses(page, pagination.limit, searchTerm)
  }

  // Handle rows per page change
  const handleLimitChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }))
    fetchProcesses(1, limit, searchTerm)
  }

  useEffect(() => {
    fetchProcesses()
  }, [fetchProcesses])

  // Modificar la función handleNewProcessSuccess para manejar correctamente el estado de carga
  const handleNewProcessSuccess = async (process: Process) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      if (dialogMode === "create") {
        // Crear nuevo proceso
        const response = await axiosInstance.post(
          "/process",
          {
            name: process.name,
            description: process.description || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.data.success) {
          toast.success("Proceso creado exitosamente")
          fetchProcesses(pagination.page, pagination.limit, searchTerm)
        } else {
          throw new Error(response.data.message || "Error creating process")
        }
      } else if (selectedProcess) {
        // Determinar qué campos han cambiado y solo enviar esos
        const changedFields: { name?: string; description?: string } = {}

        if (process.name !== selectedProcess.name) {
          changedFields.name = process.name
        }

        if (process.description !== selectedProcess.description) {
          changedFields.description = process.description || ""
        }

        // Solo realizar la solicitud si hay campos modificados
        if (Object.keys(changedFields).length > 0) {
          const response = await axiosInstance.patch(`/process/${selectedProcess.id}`, changedFields, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.data.success) {
            toast.success("Proceso actualizado exitosamente")
            fetchProcesses(pagination.page, pagination.limit, searchTerm)
          } else {
            throw new Error(response.data.message || "Error updating process")
          }
        } else {
          // No hay cambios, simplemente cerrar el diálogo
          toast.info("No se detectaron cambios en el proceso")
        }
      }

      // Cerrar el diálogo y limpiar el estado solo después de una operación exitosa
      setIsDialogOpen(false)
      setSelectedProcess(null)

      return true // Indicar éxito para que el formulario pueda actualizar su estado
    } catch (error) {
      console.error("Error saving process:", error)
      toast.error(dialogMode === "create" ? "Error al crear el proceso" : "Error al actualizar el proceso")
      return false // Indicar error para que el formulario pueda actualizar su estado
    }
  }

  const handleEdit = (process: Process) => {
    setSelectedProcess(process)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  const handleDelete = async (process: Process) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.delete(`/process/${process.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast.success("Proceso eliminado exitosamente")
        fetchProcesses(pagination.page, pagination.limit, searchTerm)
      } else {
        throw new Error(response.data.message || "Error deleting process")
      }
    } catch (error) {
      console.error("Error deleting process:", error)
      toast.error("Error al eliminar el proceso")
    }
  }

  const columns: ColumnDef<Process>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "createdAt",
      header: "Fecha de Creación",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string
        return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "N/A"
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Última Actualización",
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string
        return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "N/A"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const process = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(process)}>Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(process)} className="text-red-600">
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Procesos</h1>
        <Button
          onClick={() => {
            setSelectedProcess(null)
            setDialogMode("create")
            setIsDialogOpen(true)
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar Proceso
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={processes}
        isLoading={isLoading}
        pagination={{
          pageCount: pagination.totalPages,
          page: pagination.page,
          onPageChange: handlePageChange,
          perPage: pagination.limit,
          onPerPageChange: handleLimitChange,
        }}
        searchValue={searchTerm}
        onSearchChange={handleFilterChange}
        searchPlaceholder="Buscar por nombre de proceso..."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Agregar Nuevo Proceso" : "Editar Proceso"}</DialogTitle>
          </DialogHeader>
          <ProcessForm
            onSuccess={handleNewProcessSuccess}
            process={selectedProcess || undefined}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

