"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { User } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewUserForm } from "@/components/NewUserForm"
import { UserDetails } from "@/components/UserDetails"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { Toaster } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { debounce } from "@/utils/debounce"
import axiosInstance from "@/api/config"
import { toast } from "sonner"

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [filter, setFilter] = useState("")
  const [isDeletingUser, setIsDeletingUser] = useState(false)

  const fetchUsers = useCallback(async (page = 1, limit = 10, searchFilter = "") => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.get(`/user`, {
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

        // Map API response to our User type
        const mappedUsers = data.map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role.toLowerCase(),
          status: user.status.toLowerCase() === "active" ? "active" : "inactive",
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Nunca",
          staff: user.staff || false,
        }))

        setUsers(mappedUsers)
        setPagination({
          page: currentPage,
          limit: pageLimit,
          total,
          totalPages,
        })
      } else {
        throw new Error(response.data.message || "Error fetching users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchUsers(pagination.page, pagination.limit, value)
    }, 3000),
    [fetchUsers, pagination.page, pagination.limit],
  )

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value)
    debouncedSearch(value)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
    fetchUsers(page, pagination.limit, filter)
  }

  // Handle rows per page change
  const handleLimitChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }))
    fetchUsers(1, limit, filter)
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleNewUserSuccess = () => {
    setIsDialogOpen(false)
    fetchUsers(pagination.page, pagination.limit, filter)
  }

  const handleEdit = (user: User) => {
    setSelectedUser({
      ...user,
      staff: user.staff || false, // Ensure staff property is set
    })
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsDialogOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setIsConfirmDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedUser) {
      setIsDeletingUser(true)
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await axiosInstance.delete(`/user/${selectedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          toast.success("Usuario eliminado exitosamente")
          setIsConfirmDialogOpen(false)
          // Llamar a fetchUsers para actualizar la lista de usuarios
          await fetchUsers(pagination.page, pagination.limit, filter)
        } else {
          throw new Error(response.data.message || "Error al eliminar el usuario")
        }
      } catch (error) {
        console.error("Error deleting user:", error)
        toast.error(error.message || "Error al eliminar el usuario")
      } finally {
        setIsDeletingUser(false)
        // Limpiar el estado del modal de confirmación
        setSelectedUser(null)
      }
    }
  }

  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false)
    setSelectedUser(null)
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return <div className="capitalize">{role}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className={`capitalize ${status === "active" ? "text-green-600" : "text-red-600"}`}>
            {status === "active" ? "Activo" : "Inactivo"}
          </div>
        )
      },
    },
    {
      accessorKey: "lastLogin",
      header: "Último acceso",
    },
    {
      accessorKey: "staff",
      header: "Staff",
      cell: ({ row }) => {
        const isStaff = row.getValue("staff") as boolean
        return isStaff ? "Sí" : "No"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
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
              <DropdownMenuItem onClick={() => handleEdit(user)}>Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewDetails(user)}>Ver detalles</DropdownMenuItem>
              {user.status === "active" && (
                <DropdownMenuItem onClick={() => handleDelete(user)} className="text-red-600">
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Button
          onClick={() => {
            setSelectedUser(null)
            setDialogMode("create")
            setIsDialogOpen(true)
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={users}
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
            <DialogTitle>{dialogMode === "create" ? "Agregar Nuevo Usuario" : "Editar Usuario"}</DialogTitle>
          </DialogHeader>
          <NewUserForm onSuccess={handleNewUserSuccess} user={selectedUser || undefined} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && <UserDetails user={selectedUser} />}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        description="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
        confirmationWord="ELIMINAR"
        isConfirming={isDeletingUser}
      />
    </div>
  )
}

