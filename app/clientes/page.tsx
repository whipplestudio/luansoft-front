"use client"

import { useState, useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { DialogCreateClient } from "@/components/DialogCreateClient"
import { toast } from "sonner"
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
import axios from "axios"
import type { Client } from "@/types"
import { hasPermission, type RoleType } from "@/lib/permissions"
import { ProtectedRoute } from "@/components/ProtectedRoute"

// Actualizar la interfaz ApiClient para reflejar la nueva estructura
interface ApiClient {
  id: string
  company: string
  status: string
  type: "FISICA" | "MORAL"
  limitDay: number
  graceDays: number
  payroll: boolean
  payrollFrequencies: string[]
  regimenFiscalId: string
  isContractSigned: boolean
  contractFile: {
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
  createdAt: string
  updatedAt: string
  contador: {
    id: string
    email: string
    firstName: string
    lastName: string
    status: string
    userId: string
    createdAt: string
    updatedAt: string
  } | null
  regimenFiscal: {
    id: string
    nombre: string
    descripcion: string
  }
  contacto: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string | null
    status: string
    userId: string
    createdAt: string
    updatedAt: string
  } | null
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
  // Obtener el rol del usuario desde localStorage al cargar el componente
  const [userRole, setUserRole] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null | undefined>(null)
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [contactos, setContactos] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  interface ContactosResponse {
    success: boolean
    data: {
      data: any[]
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }

  // Función para alternar el orden de clasificación
  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(newOrder)
    fetchClients(undefined, undefined, undefined, newOrder)
  }

  // Buscar la función fetchClientes y modificarla para incluir el contadorId cuando el usuario es un contador
  const fetchClients = useCallback(
    async (search?: string, page?: number, limit?: number, order?: "asc" | "desc") => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.append("page", (page || currentPage).toString())
        params.append("limit", (limit || pageSize).toString())
        params.append("order", order || sortOrder)

        // Añadir filtro si existe
        const filterTerm = search !== undefined ? search : searchTerm
        if (filterTerm.trim()) {
          params.append("filter", filterTerm)
        }

        // Añadir contadorId si el usuario es un contador
        const role = localStorage.getItem("userRole")
        if (role === "contador") {
          const userData = localStorage.getItem("user")
          if (userData) {
            const user = JSON.parse(userData)
            if (user.contadorId) {
              params.append("contadorId", user.contadorId)
            }
          }
        }

        const response = await axiosInstance.get<ContactosResponse>(`/client?${params.toString()}`)

        if (response.data.success) {
          setContactos(response.data.data.data)
          setTotalPages(response.data.data.totalPages)
          setTotalItems(response.data.data.total)
        } else {
          toast.error("No se pudieron cargar los clientes")
        }
      } catch (error) {
        toast.error("No se pudieron cargar los clientes")
      } finally {
        setIsLoading(false)
      }
    },
    [currentPage, pageSize, searchTerm, sortOrder],
  )

  // Debounce para la búsqueda
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchClients(value)
    }, 500),
    [currentPage, pageSize, sortOrder],
  )

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Resetear a la primera página al buscar
    debouncedSearch(value)
  }

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Manejar cambio en el número de filas por página
  const handleLimitChange = (limit: number) => {
    setPageSize(limit)
    setCurrentPage(1)
  }

  // Cargar los clientes al montar el componente
  useEffect(() => {
    fetchClients()
  }, [currentPage, pageSize, sortOrder])

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
          fetchClients()
        } else {
          throw new Error(response.data.message || "Error al eliminar el cliente")
        }
      } catch (error) {
        console.error("Error al eliminar el cliente:", error)
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
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

  const handleActivate = async (client: Client) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await axiosInstance.patch(
        `/client/${client.id}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        toast.success("Cliente activado exitosamente")
        fetchClients()
      } else {
        throw new Error(response.data.message || "Error al activar el cliente")
      }
    } catch (error) {
      console.error("Error al activar el cliente:", error)
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        toast.error("Cliente no encontrado")
      } else {
        toast.error("Error al activar el cliente")
      }
    }
  }

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
      accessorKey: "company",
      header: "Empresa",
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
      accessorKey: "regimenFiscal.nombre",
      header: "Regimen fiscal",
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
        const role = userRole as RoleType | null
        const canEdit = hasPermission(role, "clientes", "edit")
        const canDelete = hasPermission(role, "clientes", "delete")

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
              {canEdit && <DropdownMenuItem onClick={() => handleEdit(client)}>Editar</DropdownMenuItem>}
              <DropdownMenuSeparator />
              {canDelete && client.status === "ACTIVE" && (
                <DropdownMenuItem onClick={() => handleDelete(client)} className="text-red-600">
                  Eliminar
                </DropdownMenuItem>
              )}
              {canEdit && client.status === "INACTIVE" && (
                <DropdownMenuItem onClick={() => handleActivate(client)} className="text-green-600">
                  Activar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role)
  }, [])

  return (
    <ProtectedRoute resource="clientes" action="view" redirectTo="/">
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={toggleSortOrder} className="flex items-center gap-1 bg-transparent">
              {sortOrder === "asc" ? (
                <>
                  <ArrowUp className="h-4 w-4" />
                  <span>A-Z</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4" />
                  <span>Z-A</span>
                </>
              )}
            </Button>
            {hasPermission(userRole as RoleType, "clientes", "create") && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Button>
            )}
          </div>
        </div>
        <DataTable
          columns={columns}
          data={contactos}
          isLoading={isLoading}
          pagination={{
            pageCount: totalPages,
            page: currentPage,
            onPageChange: handlePageChange,
            perPage: pageSize,
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
            fetchClients()
          }}
        />
        <DialogCreateClient
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          client={selectedClient}
          onSuccess={() => {
            setIsEditDialogOpen(false)
            setSelectedClient(null)
            fetchClients()
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
    </ProtectedRoute>
  )
}
