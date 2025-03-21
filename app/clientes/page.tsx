"use client"

import { useState, useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import type { Client } from "@/types"
import { mockContadores } from "@/lib/mock-data"
import { DialogCreateClient } from "@/components/DialogCreateClient"
import { toast, Toaster } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { debounce } from "@/utils/debounce"
import axiosInstance from "@/api/config"
import { ClienteDetailModal } from "@/components/ClienteDetailModal"

// Interfaz para la respuesta de la API
interface ApiClient {
  id: string
  firstName: string
  lastName: string
  company: string
  status: string
  userId: string
  email: string
  type: string
  limitDay: number
  graceDays: number
  payroll: boolean
  contadorId: string | null
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    data: ApiClient[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // ... (mantén las funciones existentes como fetchClients, handleSearchChange, etc.)

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (client: Client) => {
    setSelectedClient(client)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client)
    setIsDetailModalOpen(true)
  }

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "company",
      header: "Empresa",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return <div className="capitalize">{type === "FISICA" ? "Persona Física" : "Persona Moral"}</div>
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Contador Asignado",
      cell: ({ row }) => {
        const assignedTo = row.original.assignedTo
        if (!assignedTo) return "No asignado"
        const assignedContador = mockContadores.find((contador) => contador.id === assignedTo)
        return assignedContador?.name || "No asignado"
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className={`capitalize ${status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
            {status === "ACTIVE" ? "Activo" : "Inactivo"}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original
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
              <DropdownMenuItem onClick={() => handleViewDetails(client)}>Ver detalle</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(client)}>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              {client.status === "ACTIVE" && (
                <DropdownMenuItem onClick={() => handleDelete(client)} className="text-red-600">
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Función para obtener los clientes desde la API
  const fetchClients = useCallback(async (page = 1, limit = 10, filter = "") => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await axiosInstance.get<ApiResponse>(`/client`, {
        params: {
          page,
          limit,
          filter: filter || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        // Mapear los datos de la API al formato que espera nuestra aplicación
        const mappedClients: Client[] = response.data.data.data.map((apiClient) => ({
          id: apiClient.id,
          name: `${apiClient.firstName} ${apiClient.lastName}`,
          firstName: apiClient.firstName,
          lastName: apiClient.lastName,
          company: apiClient.company,
          email: apiClient.email,
          type: apiClient.type,
          assignedTo: apiClient.contadorId,
          status: apiClient.status,
          processes: [],
          razonSocial: apiClient.company, // Usando company como razonSocial por ahora
          lastAssignedDate: apiClient.updatedAt,
        }))

        setClients(mappedClients)
        setPagination({
          page: response.data.data.page,
          limit: response.data.data.limit,
          total: response.data.data.total,
          totalPages: response.data.data.totalPages,
        })
      } else {
        throw new Error(response.data.message || "Error al obtener los clientes")
      }
    } catch (error) {
      console.error("Error al obtener los clientes:", error)
      toast.error("Error al cargar los clientes")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce para la búsqueda
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchClients(1, pagination.limit, value)
    }, 3000),
    [fetchClients, pagination.limit],
  )

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    debouncedSearch(value)
  }

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
    fetchClients(page, pagination.limit, searchTerm)
  }

  // Manejar cambio en el número de filas por página
  const handleLimitChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }))
    fetchClients(1, limit, searchTerm)
  }

  // Cargar los clientes al montar el componente
  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const confirmDelete = async () => {
    if (selectedClient) {
      setIsDeleting(true)
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          throw new Error("No se encontró el token de autenticación")
        }

        const response = await axiosInstance.delete(`/client/${selectedClient.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          toast.success("Cliente eliminado exitosamente")
          setIsDeleteDialogOpen(false)
          fetchClients(pagination.page, pagination.limit, searchTerm)
        } else {
          throw new Error(response.data.message || "Error al eliminar el cliente")
        }
      } catch (error) {
        console.error("Error al eliminar el cliente:", error)
        if (error.response && error.response.status === 404) {
          toast.error("Cliente no encontrado")
        } else {
          toast.error("Error al eliminar el cliente")
        }
      } finally {
        setIsDeleting(false)
        setSelectedClient(null)
      }
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Cliente
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={clients}
        isLoading={isLoading}
        pagination={{
          pageCount: pagination.totalPages,
          page: pagination.page,
          onPageChange: handlePageChange,
          perPage: pagination.limit,
          onPerPageChange: handleLimitChange,
        }}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
      />
      <DialogCreateClient
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          fetchClients(pagination.page, pagination.limit, searchTerm)
        }}
      />
      <DialogCreateClient
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        client={selectedClient}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          setSelectedClient(null)
          fetchClients(pagination.page, pagination.limit, searchTerm)
        }}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Cliente"
        description="¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer."
        confirmationWord="ELIMINAR"
        isConfirming={isDeleting}
      />
      <ClienteDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        client={selectedClient}
      />
    </div>
  )
}

