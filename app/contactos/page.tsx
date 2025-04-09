"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import type { Contacto } from "@/types"
import { axiosInstance } from "@/lib/axios"
import { useToast } from "@/components/ui/use-toast"
import { UserPlus } from "lucide-react"
import { ContactoForm } from "@/components/ContactoForm"
import { ContactoDetails } from "@/components/ContactoDetails"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { debounce } from "@/utils/debounce"

interface ContactosResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    data: Contacto[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function ContactosPage() {
  const { toast } = useToast()
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Estados para modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedContacto, setSelectedContacto] = useState<Contacto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeClients, setActiveClients] = useState<{ id: string; company: string }[]>([])

  // Función para obtener los contactos desde la API
  const fetchContactos = async (search?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      params.append("limit", pageSize.toString())

      // Añadir filtro si existe
      const filterTerm = search !== undefined ? search : searchTerm
      if (filterTerm.trim()) {
        params.append("filter", filterTerm)
      }

      const response = await axiosInstance.get<ContactosResponse>(`/contacto?${params.toString()}`)

      if (response.data.success) {
        setContactos(response.data.data.data)
        setTotalPages(response.data.data.totalPages)
        setTotalItems(response.data.data.total)
      } else {
        console.error("Error en la respuesta de la API:", response.data.message)
        toast({
          title: "Error",
          description: "No se pudieron cargar los contactos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al obtener contactos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los contactos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para obtener clientes activos
  const fetchActiveClients = async () => {
    try {
      const response = await axiosInstance.get("/client")
      if (response.data.success) {
        setActiveClients(
          response.data.data.data.map((client: any) => ({
            id: client.id,
            company: client.company,
          })),
        )
      }
    } catch (error) {
      console.error("Error al obtener clientes activos:", error)
    }
  }

  // Cargar contactos al montar el componente o cuando cambian los parámetros
  useEffect(() => {
    fetchContactos()
    fetchActiveClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  // Función para manejar cambios en la búsqueda con debounce de 3 segundos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setCurrentPage(1) // Resetear a la primera página cuando se busca
      fetchContactos(value) // Pasar el valor directamente a fetchContactos
    }, 3000), // 3 segundos de debounce
    [currentPage, pageSize], // Dependencias para recrear la función cuando cambian estos valores
  )

  // Función para manejar cambios en la búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value) // Actualizar el estado inmediatamente para la UI
    debouncedSearch(value) // Llamar a la función debounced
  }

  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Función para cambiar el tamaño de página
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Resetear a la primera página cuando cambia el tamaño
  }

  // Funciones para manejar acciones de contactos
  const handleAddContacto = () => {
    setSelectedContacto(null)
    setIsFormOpen(true)
  }

  const handleViewContacto = (contacto: Contacto) => {
    setSelectedContacto(contacto)
    setIsViewOpen(true)
  }

  const handleEditContacto = (contacto: Contacto) => {
    setSelectedContacto(contacto)
    setIsFormOpen(true)
  }

  const handleDeleteContacto = (contacto: Contacto) => {
    setSelectedContacto(contacto)
    setIsDeleteOpen(true)
  }

  // Función para crear o actualizar un contacto
  const handleSubmitContacto = async (data: any, originalData?: Contacto) => {
    console.log("🚀 ~ data:", data)
    setIsSubmitting(true)
    try {
      if (originalData) {
        // Actualizar contacto existente - usar PATCH
        console.log("Actualizando contacto con PATCH:", originalData.id, data)
        const response = await axiosInstance.patch(`/contacto/${originalData.id}`, data)

        if (response.data.success) {
          toast({
            title: "Éxito",
            description: "Contacto actualizado correctamente",
          })
          fetchContactos() // Recargar la lista
          setIsFormOpen(false) // Cerrar el formulario después de actualizar
        } else {
          throw new Error(response.data.message || "Error al actualizar el contacto")
        }
      } else {
        // Crear nuevo contacto
        const response = await axiosInstance.post("/contacto", data)
        if (response.data.success) {
          toast({
            title: "Éxito",
            description: "Contacto creado correctamente",
          })
          fetchContactos() // Recargar la lista
          setIsFormOpen(false) // Cerrar el formulario después de crear
        } else {
          throw new Error(response.data.message || "Error al crear el contacto")
        }
      }
    } catch (error: any) {
      console.error("Error al guardar contacto:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el contacto",
        variant: "destructive",
      })
      throw error // Re-lanzar para que el formulario pueda manejarlo
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para eliminar un contacto
  const handleConfirmDelete = async () => {
    if (!selectedContacto) return

    setIsSubmitting(true)
    try {
      // Usar la API DELETE para eliminar el contacto
      console.log(`Eliminando contacto con ID: ${selectedContacto.id}`)
      const response = await axiosInstance.delete(`/contacto/${selectedContacto.id}`)

      if (response.data.success) {
        toast({
          title: "Éxito",
          description: "Contacto eliminado correctamente",
        })
        fetchContactos() // Recargar la lista
      } else {
        throw new Error(response.data.message || "Error al eliminar el contacto")
      }
    } catch (error: any) {
      console.error("Error al eliminar contacto:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el contacto",
        variant: "destructive",
      })
    } finally {
      setIsDeleteOpen(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Contactos</h1>
        <Button onClick={handleAddContacto} className="bg-primary-green hover:bg-primary-green/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Contacto
        </Button>
      </div>

      <DataTable
        columns={columns(handleViewContacto, handleEditContacto, handleDeleteContacto)}
        data={contactos}
        isLoading={isLoading}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por nombre o email..."
        hideSearchInput={false}
        pagination={{
          pageCount: totalPages,
          page: currentPage,
          onPageChange: handlePageChange,
          perPage: pageSize,
          onPerPageChange: handlePageSizeChange,
        }}
      />

      {/* Formulario para crear/editar contacto */}
      <ContactoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitContacto}
        contacto={selectedContacto || undefined}
        clients={activeClients}
        isSubmitting={isSubmitting}
      />

      {/* Modal para ver detalles del contacto */}
      <ContactoDetails isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} contacto={selectedContacto} />

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Contacto"
        description={`¿Estás seguro de que deseas eliminar el contacto ${selectedContacto?.firstName} ${selectedContacto?.lastName}? El contacto será desasignado de los clientes a los que se encuentra asignado actualmente.`}
        confirmationWord="Eliminar"
        isConfirming={isSubmitting}
      />
    </div>
  )
}
