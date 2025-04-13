"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RegimenFiscalForm } from "@/components/RegimenFiscalForm"
import type { RegimenFiscal } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import {
  getRegimenesFiscales,
  createRegimenFiscal,
  updateRegimenFiscal,
  deleteRegimenFiscal,
  activateRegimenFiscal,
  type RegimenFiscalCreateUpdateDto,
} from "@/src/regimen-fiscal/regimen-fiscal.service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { hasPermission, type RoleType } from "@/lib/permissions"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function RegimenesFiscalesPage() {
  // Obtener el rol del usuario desde localStorage al cargar el componente
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role)
  }, [])

  const [regimenesFiscales, setRegimenesFiscales] = useState<RegimenFiscal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRegimenFiscal, setSelectedRegimenFiscal] = useState<RegimenFiscal | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [regimenToToggle, setRegimenToToggle] = useState<RegimenFiscal | null>(null)
  const { toast } = useToast()

  const fetchData = async (page = currentPage, filter = searchValue, perPage = itemsPerPage) => {
    setIsLoading(true)
    try {
      const response = await getRegimenesFiscales(page, perPage, filter)
      if (response.success) {
        setRegimenesFiscales(response.data.data)
        setTotalPages(response.data.totalPages)
        setCurrentPage(response.data.page)
        setItemsPerPage(response.data.limit)
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los regímenes fiscales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, searchValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue])

  const handleOpenCreateDialog = () => {
    setSelectedRegimenFiscal(undefined)
    setOpenDialog(true)
  }

  const handleOpenEditDialog = (regimenFiscal: RegimenFiscal) => {
    setSelectedRegimenFiscal(regimenFiscal)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedRegimenFiscal(undefined)
  }

  const handleSubmit = async (data: { nombre: string; descripcion: string }) => {
    try {
      if (selectedRegimenFiscal) {
        // Update existing regime - only send changed fields
        const changedFields: RegimenFiscalCreateUpdateDto = {}

        if (data.nombre !== selectedRegimenFiscal.nombre) {
          changedFields.nombre = data.nombre
        }

        if (data.descripcion !== selectedRegimenFiscal.descripcion) {
          changedFields.descripcion = data.descripcion
        }

        // Only proceed with update if there are changes
        if (Object.keys(changedFields).length > 0) {
          const response = await updateRegimenFiscal(selectedRegimenFiscal.id, changedFields)
          if (response.success) {
            toast({
              title: "Régimen fiscal actualizado",
              description: "El régimen fiscal ha sido actualizado correctamente",
            })
            fetchData()
          } else {
            throw new Error(response.message)
          }
        } else {
          // No changes were made
          toast({
            title: "Sin cambios",
            description: "No se detectaron cambios en el régimen fiscal",
          })
        }
      } else {
        // Create new regime
        const response = await createRegimenFiscal(data)
        if (response.success) {
          toast({
            title: "Régimen fiscal creado",
            description: "El régimen fiscal ha sido creado correctamente",
          })
          fetchData()
        } else {
          throw new Error(response.message)
        }
      }
      handleCloseDialog()
    } catch (error: any) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Ocurrió un error al guardar el régimen fiscal",
        variant: "destructive",
      })
      throw error // Re-lanzar para que el formulario pueda manejarlo
    }
  }

  const handleOpenStatusDialog = (regimenFiscal: RegimenFiscal) => {
    setRegimenToToggle(regimenFiscal)
    setStatusDialogOpen(true)
  }

  const handleStatusConfirm = async () => {
    if (!regimenToToggle) return

    try {
      let response

      if (regimenToToggle.status === "ACTIVE") {
        // Deactivate (delete) the regime
        response = await deleteRegimenFiscal(regimenToToggle.id)
      } else {
        // Activate the regime
        response = await activateRegimenFiscal(regimenToToggle.id)
      }

      if (response.success) {
        toast({
          title: regimenToToggle.status === "ACTIVE" ? "Régimen fiscal desactivado" : "Régimen fiscal activado",
          description: `El régimen fiscal ha sido ${regimenToToggle.status === "ACTIVE" ? "desactivado" : "activado"} correctamente`,
        })
        fetchData()
      } else {
        throw new Error(response.message)
      }
    } catch (error: any) {
      console.error("Error toggling regimen fiscal status:", error)
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          `Ocurrió un error al ${regimenToToggle.status === "ACTIVE" ? "desactivar" : "activar"} el régimen fiscal`,
        variant: "destructive",
      })
    } finally {
      setStatusDialogOpen(false)
      setRegimenToToggle(null)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchData(page)
  }

  const handlePerPageChange = (perPage: number) => {
    setItemsPerPage(perPage)
    setCurrentPage(1) // Reset to first page when changing items per page
    fetchData(1, searchValue, perPage)
  }

  // Modificar las columnas para aplicar permisos
  const modifiedColumns = columns({
    onEdit: hasPermission(userRole as RoleType, "regimenes-fiscales", "edit") ? handleOpenEditDialog : undefined,
    onToggleStatus: hasPermission(userRole as RoleType, "regimenes-fiscales", "delete")
      ? handleOpenStatusDialog
      : undefined,
  })

  return (
    <ProtectedRoute resource="regimenes-fiscales" action="view" redirectTo="/">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Regímenes Fiscales</h1>
          {hasPermission(userRole as RoleType, "regimenes-fiscales", "create") && (
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Régimen Fiscal
            </Button>
          )}
        </div>

        <DataTable
          columns={modifiedColumns}
          data={regimenesFiscales}
          isLoading={isLoading}
          onRowClick={() => {}}
          searchValue={searchValue}
          onSearchChange={(value) => setSearchValue(value)}
          searchPlaceholder="Buscar por nombre o descripción..."
          pagination={{
            pageCount: totalPages,
            page: currentPage,
            onPageChange: (page) => handlePageChange(page),
            perPage: itemsPerPage,
            onPerPageChange: handlePerPageChange,
          }}
        />

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedRegimenFiscal ? "Editar Régimen Fiscal" : "Crear Régimen Fiscal"}</DialogTitle>
            </DialogHeader>
            <RegimenFiscalForm
              initialData={selectedRegimenFiscal}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {regimenToToggle?.status === "ACTIVE"
                  ? "¿Está seguro de desactivar este régimen fiscal?"
                  : "¿Está seguro de activar este régimen fiscal?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {regimenToToggle?.status === "ACTIVE"
                  ? "Esta acción desactivará el régimen fiscal."
                  : "Esta acción activará el régimen fiscal."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleStatusConfirm}
                className={
                  regimenToToggle?.status === "ACTIVE"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }
              >
                {regimenToToggle?.status === "ACTIVE" ? "Desactivar" : "Activar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
