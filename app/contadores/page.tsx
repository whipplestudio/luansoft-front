"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Contador } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ContadorForm } from "@/components/ContadorForm"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { Toaster } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ContadorDetailsDialog } from "@/components/ContadorDetailsDialog"
import { useRouter } from "next/navigation"
import axiosInstance from "@/api/config"
import { debounce } from "@/utils/debounce"
import { toast } from "sonner"

export default function ContadoresPage() {
  const router = useRouter()
  const [contadores, setContadores] = useState<Contador[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedContador, setSelectedContador] = useState<Contador | null>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [filter, setFilter] = useState("")

  const fetchContadores = useCallback(async (page = 1, limit = 10, searchFilter = "") => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.get(`/contador`, {
        params: {
          page,
          limit,
          filter: searchFilter || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        const { data, total, page: currentPage, limit: pageLimit, totalPages } = response.data.data

        const mappedContadores: Contador[] = data.map((contador: any) => ({
          id: contador.id,
          name: `${contador.firstName} ${contador.lastName}`,
          email: contador.email,
          role: "contador",
          status: contador.status.toLowerCase(),
          lastLogin: contador.lastLogin ? new Date(contador.lastLogin).toLocaleString() : "N/A",
          clients: [],
        }))

        setContadores(mappedContadores)
        setPagination({
          page: currentPage,
          limit: pageLimit,
          total,
          totalPages,
        })
      } else {
        throw new Error(response.data.message || "Error fetching contadores")
      }
    } catch (error) {
      console.error("Error fetching contadores:", error)
      toast.error("Error al cargar los contadores")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchContadores(pagination.page, pagination.limit, value)
    }, 3000),
    [fetchContadores],
  )

  const handleFilterChange = (value: string) => {
    setFilter(value)
    debouncedSearch(value)
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
    fetchContadores(page, pagination.limit, filter)
  }

  const handleLimitChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }))
    fetchContadores(1, limit, filter)
  }

  useEffect(() => {
    fetchContadores()
  }, [fetchContadores])

  const handleNewContadorSuccess = () => {
    setIsDialogOpen(false)
    fetchContadores(pagination.page, pagination.limit, filter)
  }

  const handleEdit = (contador: Contador) => {
    setSelectedContador(contador)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  const handleViewDetails = (contador: Contador) => {
    setSelectedContador(contador)
    setIsDetailsDialogOpen(true)
  }

  const handleDelete = (contador: Contador) => {
    setSelectedContador(contador)
    setIsConfirmDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedContador) {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await axiosInstance.delete(`/contador/${selectedContador.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          toast.success("Contador eliminado exitosamente")
          setIsConfirmDialogOpen(false)
          fetchContadores(pagination.page, pagination.limit, filter)
        } else {
          throw new Error(response.data.message || "Error al eliminar el contador")
        }
      } catch (error) {
        console.error("Error deleting contador:", error)
        if (error.response && error.response.data) {
          toast.error(error.response.data.message || "Error al eliminar el contador")
        } else {
          toast.error("Error al eliminar el contador")
        }
      } finally {
        setSelectedContador(null)
      }
    }
  }

  const handleRowClick = (contador: Contador) => {
    router.push(`/contadores/${contador.id}/clientes`)
  }

  const columns: ColumnDef<Contador>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <span className={row.original.status === "active" ? "text-green-600" : "text-red-600"}>
          {row.original.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      accessorKey: "clients",
      header: "Clientes Asignados",
      cell: ({ row }) => row.original.clients.length,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contador = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(contador)
                }}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails(contador)
                }}
              >
                Ver detalles
              </DropdownMenuItem>
              {contador.status === "active" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(contador)
                  }}
                  className="text-red-600"
                >
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false)
    setSelectedContador(null)
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Contadores</h1>
        <Button
          onClick={() => {
            setSelectedContador(null)
            setDialogMode("create")
            setIsDialogOpen(true)
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar Contador
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={contadores}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        pagination={{
          pageCount: pagination.totalPages,
          page: pagination.page,
          onPageChange: handlePageChange,
          perPage: pagination.limit,
          onPerPageChange: handleLimitChange,
        }}
        searchValue={filter}
        onSearchChange={handleFilterChange}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Agregar Nuevo Contador" : "Editar Contador"}</DialogTitle>
          </DialogHeader>
          <ContadorForm onSuccess={handleNewContadorSuccess} contador={selectedContador || undefined} />
        </DialogContent>
      </Dialog>

      <ContadorDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        contador={selectedContador}
      />

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={confirmDelete}
        title="Eliminar Contador"
        description="¿Estás seguro de que quieres eliminar este contador? Esta acción no se puede deshacer."
        confirmationWord="ELIMINAR"
      />
    </div>
  )
}

