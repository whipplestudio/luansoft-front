"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, ChevronDown, CalendarIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Client, Process, ProcessAssignment } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AssignProcessForm } from "@/components/AssignProcessForm"
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
import axiosInstance from "@/api/config"
import axios from "axios"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Añadir la importación del nuevo componente al principio del archivo, junto con las otras importaciones
import { UploadPaymentProofDialog } from "@/components/UploadPaymentProofDialog"

// Buscar el import de MultiSelect
// import { SearchableSelect } from "@/components/ui/searchable-select"

export default function AsignarProcesosPage() {
  const [assignments, setAssignments] = useState<ProcessAssignment[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedProcess, setSelectedProcess] = useState<string>("") // Nuevo estado para el proceso seleccionado
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [allActiveClients, setAllActiveClients] = useState<Client[]>([])
  const [processes, setProcesses] = useState<Process[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Estados para la confirmación de eliminación
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<ProcessAssignment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estados para la edición de fecha de compromiso
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [assignmentToEdit, setAssignmentToEdit] = useState<ProcessAssignment | null>(null)
  const [newCommitmentDate, setNewCommitmentDate] = useState<Date | undefined>(undefined)
  // Añadir un nuevo estado para los días de gracia después de la declaración del estado newCommitmentDate
  const [newGraceDays, setNewGraceDays] = useState<number | undefined>(undefined)
  const [isUpdating, setIsUpdating] = useState(false)

  // Primero, añadir un nuevo estado para el diálogo de carga de archivos después de la declaración de isUpdating
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [processingAssignment, setProcessingAssignment] = useState<ProcessAssignment | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Primero, añadamos un nuevo estado para las frecuencias de nómina
  const [newPayrollFrequencies, setNewPayrollFrequencies] = useState<string[]>([])

  // Añadir un nuevo estado para el período de pago
  const [newPaymentPeriod, setNewPaymentPeriod] = useState<"MONTHLY" | "ANNUAL">("MONTHLY")

  // Función para obtener todos los clientes activos para el select
  const fetchActiveClients = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.get("/client/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        // Mapear los datos de la API al formato que espera el componente
        const clientsData = response.data.data.data.map((client: any) => ({
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
          firstName: client.firstName,
          lastName: client.lastName,
          company: client.company,
          email: client.email,
          type: client.type,
          assignedTo: client.contadorId,
          status: client.status,
          processes: [],
          razonSocial: client.company,
          lastAssignedDate: client.updatedAt,
        }))
        setAllActiveClients(clientsData)
      } else {
        throw new Error(response.data.message || "Error fetching active clients")
      }
    } catch (error) {
      console.error("Error fetching active clients:", error)
      toast.error("Error al cargar los clientes activos")
    }
  }, [])

  // Función para obtener los procesos desde la API
  const fetchProcesses = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.get("/process", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        const processesData = response.data.data.data.map((process: Process) => ({
          ...process,
          progress: 0,
        }))
        setProcesses(processesData)
      } else {
        throw new Error(response.data.message || "Error fetching processes")
      }
    } catch (error) {
      console.error("Error fetching processes:", error)
      toast.error("Error al cargar los procesos")
    }
  }, [])

  // Modificar la función fetchClientsWithProcesses para adaptarla a la nueva estructura de respuesta de la API
  // Reemplazar la implementación actual de fetchClientsWithProcesses con esta nueva versión:

  const fetchClientsWithProcesses = useCallback(async (page = 1, limit = 10, clientId?: string, processId?: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Construir los parámetros de la consulta
      const params: Record<string, any> = {
        page,
        limit,
      }

      // Añadir clientId a los parámetros si está definido
      if (clientId) {
        params.clientId = clientId
      }

      // Añadir processId a los parámetros si está definido
      if (processId) {
        params.processId = processId
      }

      const response = await axiosInstance.get("/client/with-processes", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        const { data, total, page: currentPage, limit: pageLimit, totalPages } = response.data.data

        // Extraer los clientes únicos de las asignaciones
        const uniqueClients = new Map<string, Client>()

        data.forEach((assignment: any) => {
          if (assignment.client && !uniqueClients.has(assignment.client.id)) {
            uniqueClients.set(assignment.client.id, {
              id: assignment.client.id,
              company: assignment.client.company,
              type: assignment.client.type,
              status: assignment.client.status,
              processes: [],
              regimenFiscalId: assignment.client.regimenFiscalId || null,
              contador: assignment.client.contador || null,
              contacto: assignment.client.contacto || null,
              isAssigned: assignment.client.isAssigned || false,
              createdAt: assignment.client.createdAt || "",
              updatedAt: assignment.client.updatedAt || "",
            })
          }
        })

        // Mapear las asignaciones de procesos directamente desde la respuesta
        const assignmentsData: ProcessAssignment[] = data.map((assignment: any) => ({
          id: assignment.id,
          clientId: assignment.clientId,
          processId: assignment.processId,
          commitmentDate: assignment.date,
          status: assignment.status,
          graceDays: assignment.graceDays,
          payrollFrequencies: assignment.payrollFrequencies || [],
          paymentPeriod: assignment.paymentPeriod, // Asegurarse de incluir el paymentPeriod
          process: {
            id: assignment.process.id,
            name: assignment.process.name,
            description: assignment.process.description,
            progress: 0,
            createdAt: assignment.process.createdAt,
            updatedAt: assignment.process.updatedAt,
          },
        }))

        setClients(Array.from(uniqueClients.values()))
        setAssignments(assignmentsData)
        setPagination({
          page: currentPage || 1,
          limit: pageLimit || 10,
          total: total || 0,
          totalPages: totalPages || 1,
        })
      } else {
        throw new Error(response.data.message || "Error fetching clients with processes")
      }
    } catch (error) {
      console.error("Error fetching clients with processes:", error)
      toast.error("Error al cargar los clientes con procesos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchActiveClients(),
        fetchProcesses(),
        fetchClientsWithProcesses(pagination.page, pagination.limit, selectedClient, selectedProcess),
      ])
    }

    loadData()
  }, [
    fetchActiveClients,
    fetchProcesses,
    fetchClientsWithProcesses,
    pagination.page,
    pagination.limit,
    selectedClient,
    selectedProcess,
  ])

  // Manejar cambio de cliente seleccionado
  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId)
    // Resetear a la página 1 cuando se cambia el filtro
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Manejar cambio de proceso seleccionado
  const handleProcessChange = (processId: string) => {
    setSelectedProcess(processId)
    // Resetear a la página 1 cuando se cambia el filtro
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  // Manejar cambio de límite por página
  const handleLimitChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }))
  }

  // Actualizo la función handleAssignProcessSuccess para incluir graceDays en la llamada a la API
  const handleAssignProcessSuccess = async (assignment: {
    clientId: string
    processId: string
    commitmentDate?: string
    graceDays?: number
    payrollFrequencies?: string[]
    paymentPeriod?: "MONTHLY" | "ANNUAL"
  }) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Determinar si es un proceso de nómina basado en la presencia de payrollFrequencies
      const isPayrollProcess = assignment.payrollFrequencies !== undefined

      // Preparar los datos según el tipo de proceso
      const requestData = isPayrollProcess
        ? {
            clientId: assignment.clientId,
            processId: assignment.processId,
            payrollFrequencies: assignment.payrollFrequencies,
          }
        : {
            clientId: assignment.clientId,
            processId: assignment.processId,
            date: assignment.commitmentDate?.split("T")[0], // Formato YYYY-MM-DD
            graceDays: assignment.graceDays,
            paymentPeriod: assignment.paymentPeriod, // Incluir el período de pago
          }

      // Llamar a la API para asignar el proceso
      const response = await axiosInstance.post("/process/assign", requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        // Obtener los datos de la respuesta
        const assignmentData = response.data.data

        // Buscar el proceso para incluirlo en la asignación
        const process = processes.find((p) => p.id === assignmentData.processId)

        if (!process) {
          toast.error("Proceso no encontrado")
          return
        }

        // Crear objeto de asignación con los datos de la respuesta
        const newAssignment: ProcessAssignment = {
          id: assignmentData.id,
          clientId: assignmentData.clientId,
          processId: assignmentData.processId,
          commitmentDate: assignmentData.date,
          status: assignmentData.status, // Añadir el status del proceso
          process,
          graceDays: assignmentData.graceDays, // Añado los días de gracia
        }

        // Verificar si ya existe una asignación para este cliente y proceso
        const existingIndex = assignments.findIndex(
          (a) => a.clientId === assignmentData.clientId && a.processId === assignmentData.processId,
        )

        if (existingIndex !== -1) {
          // Actualizar la asignación existente
          const updatedAssignments = [...assignments]
          updatedAssignments[existingIndex] = newAssignment
          setAssignments(updatedAssignments)
          toast.success("Fecha de compromiso actualizada exitosamente")
        } else {
          // Añadir nueva asignación
          setAssignments([...assignments, newAssignment])
          toast.success("Proceso asignado exitosamente")
        }

        setIsDialogOpen(false)

        // Recargar los datos para asegurar que todo está sincronizado
        fetchClientsWithProcesses(pagination.page, pagination.limit, selectedClient, selectedProcess)
      } else {
        throw new Error(response.data.message || "Error al asignar el proceso")
      }
    } catch (error) {
      console.error("Error al asignar el proceso:", error)
      toast.error("Error al asignar el proceso. Por favor, intente nuevamente.")
    }
  }

  // Función para abrir el diálogo de edición
  // Luego, modifiquemos la función handleEdit para detectar si es un proceso de nómina y establecer las frecuencias
  const handleEdit = (assignment: ProcessAssignment) => {
    setAssignmentToEdit(assignment)

    // Verificar si es un proceso de nómina (exactamente "nómina" o "nomina")
    const processName = assignment.process.name.toLowerCase().trim()
    const isPayroll = processName === "nómina" || processName === "nomina"

    if (isPayroll) {
      // Si es nómina, establecer las frecuencias
      setNewPayrollFrequencies(assignment.payrollFrequencies || [])
    } else {
      // Si no es nómina, establecer la fecha de compromiso
      if (assignment.commitmentDate) {
        const dateParts = assignment.commitmentDate.split("T")[0].split("-")
        const year = Number.parseInt(dateParts[0])
        const month = Number.parseInt(dateParts[1]) - 1 // Los meses en JavaScript son 0-indexados
        const day = Number.parseInt(dateParts[2])

        setNewCommitmentDate(new Date(year, month, day))
      }

      // Establecer los días de gracia
      setNewGraceDays(assignment.graceDays || 0)

      // Establecer el período de pago desde la asignación
      setNewPaymentPeriod(assignment.paymentPeriod || "MONTHLY")
    }

    setIsEditDialogOpen(true)
  }

  // Modificar la función handleUpdateCommitmentDate para incluir los días de gracia
  // Ahora, modifiquemos la función handleUpdateCommitmentDate para manejar ambos casos
  const handleUpdateCommitmentDate = async () => {
    if (!assignmentToEdit) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Verificar si es un proceso de nómina (exactamente "nómina" o "nomina")
      const processName = assignmentToEdit.process.name.toLowerCase().trim()
      const isPayroll = processName === "nómina" || processName === "nomina"

      // Preparar los datos según el tipo de proceso
      let requestData
      if (isPayroll) {
        requestData = {
          payrollFrequencies: newPayrollFrequencies,
        }
      } else {
        // Formatear la fecha como YYYY-MM-DD
        const formattedDate = newCommitmentDate ? format(newCommitmentDate, "yyyy-MM-dd") : undefined
        requestData = {
          date: formattedDate,
          graceDays: newGraceDays, // Incluir los días de gracia en la solicitud
          paymentPeriod: newPaymentPeriod, // Incluir el período de pago
        }
      }

      // Llamar a la API para actualizar el proceso
      const response = await axiosInstance.patch(
        `/process/assign/${assignmentToEdit.clientId}/${assignmentToEdit.processId}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        // Actualizar el estado local
        const updatedAssignments = assignments.map((a) =>
          a.id === assignmentToEdit.id
            ? {
                ...a,
                commitmentDate: response.data.data.date,
                graceDays: response.data.data.graceDays,
                payrollFrequencies: response.data.data.payrollFrequencies,
              }
            : a,
        )

        setAssignments(updatedAssignments)
        toast.success("Proceso actualizado exitosamente")

        // Recargar los datos para asegurar que todo está sincronizado
        fetchClientsWithProcesses(pagination.page, pagination.limit, selectedClient, selectedProcess)
      } else {
        throw new Error(response.data.message || "Error al actualizar el proceso")
      }
    } catch (error) {
      console.error("Error al actualizar el proceso:", error)
      toast.error("Error al actualizar el proceso. Por favor, intente nuevamente.")
    } finally {
      setIsUpdating(false)
      setIsEditDialogOpen(false)
      setAssignmentToEdit(null)
      setNewCommitmentDate(undefined)
      setNewGraceDays(undefined)
      setNewPayrollFrequencies([])
      setNewPaymentPeriod("MONTHLY")
    }
  }

  // Reemplazar la función handleDelete existente with this new implementation
  const handleDelete = (assignment: ProcessAssignment) => {
    setAssignmentToDelete(assignment)
    setIsConfirmDialogOpen(true)
  }

  // Añadir esta nueva función para confirmar la eliminación
  const confirmDelete = async () => {
    if (!assignmentToDelete) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Llamar a la API para eliminar la asignación
      const response = await axiosInstance.delete(
        `/process/assign/${assignmentToDelete.clientId}/${assignmentToDelete.processId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        // Actualizar el estado local eliminando la asignación
        setAssignments(assignments.filter((a) => a.id !== assignmentToDelete.id))
        toast.success("Asignación eliminada exitosamente")

        // Recargar los datos para asegurar que todo está sincronizado
        fetchClientsWithProcesses(pagination.page, pagination.limit, selectedClient, selectedProcess)
      } else {
        throw new Error(response.data.message || "Error al eliminar la asignación")
      }
    } catch (error) {
      console.error("Error al eliminar la asignación:", error)
      toast.error("Error al eliminar la asignación. Por favor, intente nuevamente.")
    } finally {
      setIsDeleting(false)
      setIsConfirmDialogOpen(false)
      setAssignmentToDelete(null)
    }
  }

  // Añadir una nueva función para activar un proceso después de la función confirmDelete
  const handleActivateProcess = async (assignment: ProcessAssignment) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Llamar a la API para activar la asignación
      const response = await axiosInstance.patch(
        `/process/assign/${assignment.clientId}/${assignment.processId}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        // Actualizar el estado local cambiando el status del proceso a ACTIVE
        setAssignments(assignments.map((a) => (a.id === assignment.id ? { ...a, status: "ACTIVE" } : a)))
        toast.success("Proceso activado exitosamente")

        // Recargar los datos para asegurar que todo está sincronizado
        fetchClientsWithProcesses(pagination.page, pagination.limit, selectedClient, selectedProcess)
      } else {
        throw new Error(response.data.message || "Error al activar el proceso")
      }
    } catch (error) {
      console.error("Error al activar el proceso:", error)
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response.status === 404
      ) {
        toast.error("Proceso no encontrado o ya está activo")
      } else {
        toast.error("Error al activar el proceso. Por favor, intente nuevamente.")
      }
    }
  }

  // Primero, añadamos la función para marcar un proceso como pagado después de la función handleActivateProcess
  // Añadir después de la función handleActivateProcess

  // Reemplazar la función handleMarkAsPaid existente con esta nueva implementación
  const handleMarkAsPaid = (assignment: ProcessAssignment) => {
    setProcessingAssignment(assignment)
    setIsUploadDialogOpen(true)
  }

  // Añadir esta nueva función después de handleMarkAsPaid
  const uploadPaymentProofAndMarkAsPaid = async (file: File) => {
    if (!processingAssignment) return

    setIsUploading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) throw new Error("No authentication token found")

      // Crear un FormData para enviar el archivo
      const formData = new FormData()
      formData.append("file", file)

      // Llamar a la API para marcar el proceso como pagado con el archivo adjunto
      const response = await axiosInstance.patch(
        `/process/assign/${processingAssignment.clientId}/${processingAssignment.processId}/mark-paid`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      )

      if (response.data.success) {
        // Actualizar el estado local cambiando el status del proceso a PAID
        setAssignments(assignments.map((a) => (a.id === processingAssignment.id ? { ...a, status: "PAID" } : a)))
        toast.success("Proceso marcado como pagado exitosamente")

        // Recargar los datos para asegurar que todo está sincronizado
        fetchClientsWithProcesses(pagination.page, pagination.limit, selectedClient, selectedProcess)

        // Cerrar el diálogo
        setIsUploadDialogOpen(false)
        setProcessingAssignment(null)
      } else {
        throw new Error(response.data.message || "Error al marcar el proceso como pagado")
      }
    } catch (error) {
      console.error("Error al marcar el proceso como pagado:", error)
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        toast.error(error.response.data.message || "Error al marcar el proceso como pagado")
      } else {
        toast.error("Error al marcar el proceso como pagado. Por favor, intente nuevamente.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  // Modificar la columna de acciones para mostrar diferentes opciones según el estado del proceso
  const columns: ColumnDef<ProcessAssignment>[] = [
    {
      accessorKey: "clientId",
      header: "Cliente",
      cell: ({ row }) => {
        const clientId = row.getValue("clientId") as string
        const client = clients.find((c) => c.id === clientId)
        return client ? client.company : "Cliente no encontrado"
      },
    },
    {
      accessorKey: "process.name",
      header: "Proceso",
    },
    // Modificar la celda de la columna "Fecha de Compromiso" para manejar correctamente la zona horaria
    {
      accessorKey: "commitmentDate",
      header: "Fecha de Compromiso",
      cell: ({ row }) => {
        const dateString = row.getValue("commitmentDate") as string
        if (!dateString) return "No disponible"

        // Extraer solo la parte de la fecha (YYYY-MM-DD) para evitar problemas de zona horaria
        const dateParts = dateString.split("T")[0].split("-")
        const year = Number.parseInt(dateParts[0])
        const month = Number.parseInt(dateParts[1]) - 1 // Los meses en JavaScript son 0-indexados
        const day = Number.parseInt(dateParts[2])

        // Crear una fecha usando los componentes individuales para evitar ajustes de zona horaria
        const date = new Date(year, month, day)

        return format(date, "dd/MM/yyyy", { locale: es })
      },
    },
    {
      accessorKey: "payrollFrequencies",
      header: "Frecuencia de Nómina",
      cell: ({ row }) => {
        const assignment = row.original
        const frequencies = assignment.payrollFrequencies || []

        if (frequencies.length === 0) {
          return "-"
        }

        const formattedFrequencies = frequencies.map((freq) => (freq === "QUINCENAL" ? "Quincenal" : "Semanal"))

        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            {formattedFrequencies.join(" y ")}
          </Badge>
        )
      },
    },
    // Añadir nueva columna para mostrar los días de gracia
    {
      accessorKey: "graceDays",
      header: "Días de Gracia",
      cell: ({ row }) => {
        const graceDays = row.getValue("graceDays") as number
        return graceDays !== undefined ? graceDays : "0"
      },
    },
    // Añadir una columna para mostrar el período de pago en la tabla
    // Buscar la definición de columns y añadir una nueva columna después de graceDays

    // Añadir nueva columna para mostrar el período de pago
    {
      accessorKey: "paymentPeriod",
      header: "Período de Pago",
      cell: ({ row }) => {
        const assignment = row.original

        // Si es un proceso de nómina, no mostrar período de pago
        if (assignment.payrollFrequencies && assignment.payrollFrequencies.length > 0) {
          return "-"
        }

        const paymentPeriod = row.getValue("paymentPeriod") as string
        return paymentPeriod === "MONTHLY" ? "Mensual" : "Anual"
      },
    },
    // Reemplazar la columna de estado existente con esta versión actualizada
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={status === "ACTIVE" ? "default" : status === "PAID" ? "outline" : "secondary"}
            className={
              status === "ACTIVE"
                ? "bg-green-500"
                : status === "PAID"
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : "bg-red-500"
            }
          >
            {status === "ACTIVE" ? "Activo" : status === "PAID" ? "Pagado" : "Inactivo"}
          </Badge>
        )
      },
    },
    // Finalmente, modifiquemos el menú de acciones para incluir la opción "Completar"
    // Buscar la definición de la columna "actions" y reemplazarla

    // Reemplazar la columna de acciones existente with this versión actualizada
    {
      id: "actions",
      cell: ({ row }) => {
        const assignment = row.original
        const isActive = assignment.status === "ACTIVE"
        const isPaid = assignment.status === "PAID"

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
              {isActive && (
                <>
                  <DropdownMenuItem onClick={() => handleEdit(assignment)} className="text-blue-600">
                    Editar Proceso
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMarkAsPaid(assignment)} className="text-green-600">
                    Completar
                  </DropdownMenuItem>
                </>
              )}
              {isActive ? (
                <DropdownMenuItem onClick={() => handleDelete(assignment)} className="text-red-600">
                  Eliminar Asignación
                </DropdownMenuItem>
              ) : isPaid ? (
                <DropdownMenuItem disabled className="opacity-50">
                  Proceso completado
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleActivateProcess(assignment)} className="text-green-600">
                  Activar Proceso
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const title = "Eliminar Asignación"
  const description = "Esta acción eliminará la asignación del proceso al cliente. ¿Estás seguro?"
  const confirmationWord = "ELIMINAR"
  const isConfirming = isDeleting

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asignación de Procesos</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Asignar Proceso
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Filtro por Cliente */}
        <div>
          <label className="block text-sm font-medium mb-2">Filtrar por Cliente</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedClient
                  ? allActiveClients.find((c) => c.id === selectedClient)?.company || "Cliente seleccionado"
                  : "Todos los clientes"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => handleClientChange("")} className="cursor-pointer">
                      Todos los clientes
                    </CommandItem>
                    {allActiveClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        onSelect={() => handleClientChange(client.id)}
                        className="cursor-pointer"
                      >
                        {client.company}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Filtro por Proceso */}
        <div>
          <label className="block text-sm font-medium mb-2">Filtrar por Proceso</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedProcess
                  ? processes.find((p) => p.id === selectedProcess)?.name || "Proceso seleccionado"
                  : "Todos los procesos"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Buscar proceso..." />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>No se encontraron procesos.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => handleProcessChange("")} className="cursor-pointer">
                      Todos los procesos
                    </CommandItem>
                    {processes.map((process) => (
                      <CommandItem
                        key={process.id}
                        onSelect={() => handleProcessChange(process.id)}
                        className="cursor-pointer"
                      >
                        {process.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={assignments}
        isLoading={isLoading}
        hideSearchInput={true}
        pagination={{
          pageCount: pagination.totalPages,
          page: pagination.page,
          onPageChange: handlePageChange,
          perPage: pagination.limit,
          onPerPageChange: handleLimitChange,
        }}
      />
      {/* Diálogo para asignar proceso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Proceso a Cliente</DialogTitle>
          </DialogHeader>
          <AssignProcessForm
            onSuccess={handleAssignProcessSuccess}
            onCancel={() => setIsDialogOpen(false)}
            clients={allActiveClients}
            processes={processes}
            existingAssignments={assignments}
          />
        </DialogContent>
      </Dialog>
      {/* Diálogo para editar fecha de compromiso */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setAssignmentToEdit(null)
            setNewCommitmentDate(undefined)
            setNewGraceDays(undefined)
            setNewPayrollFrequencies([])
            setNewPaymentPeriod("MONTHLY")
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Proceso</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {assignmentToEdit && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Cliente:</Label>
                  <div className="col-span-3">
                    {clients.find((c) => c.id === assignmentToEdit.clientId)?.company || "Cliente no encontrado"}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Proceso:</Label>
                  <div className="col-span-3">{assignmentToEdit.process.name}</div>
                </div>

                {/* Verificar si es un proceso de nómina */}
                {assignmentToEdit?.process.name.toLowerCase().trim() === "nómina" ||
                assignmentToEdit?.process.name.toLowerCase().trim() === "nomina" ? (
                  // Mostrar opciones de frecuencia para procesos de nómina
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Frecuencia:</Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="quincenal"
                          checked={newPayrollFrequencies.includes("QUINCENAL")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewPayrollFrequencies((prev) => [...prev, "QUINCENAL"])
                            } else {
                              setNewPayrollFrequencies((prev) => prev.filter((f) => f !== "QUINCENAL"))
                            }
                          }}
                        />
                        <Label htmlFor="quincenal">Quincenal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="semanal"
                          checked={newPayrollFrequencies.includes("SEMANAL")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewPayrollFrequencies((prev) => [...prev, "SEMANAL"])
                            } else {
                              setNewPayrollFrequencies((prev) => prev.filter((f) => f !== "SEMANAL"))
                            }
                          }}
                        />
                        <Label htmlFor="semanal">Semanal</Label>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Mostrar campos de fecha y días de gracia para otros procesos
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="commitmentDate" className="text-right">
                        Fecha de Compromiso:
                      </Label>
                      <div className="col-span-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newCommitmentDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newCommitmentDate ? (
                                format(newCommitmentDate, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newCommitmentDate}
                              onSelect={setNewCommitmentDate}
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="graceDays" className="text-right">
                        Días de Gracia:
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="graceDays"
                          type="number"
                          min="0"
                          value={newGraceDays !== undefined ? newGraceDays : 0}
                          onChange={(e) => setNewGraceDays(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="paymentPeriod" className="text-right">
                        Período de Pago:
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={newPaymentPeriod}
                          onValueChange={(value: "MONTHLY" | "ANNUAL") => setNewPaymentPeriod(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MONTHLY">Mensual</SelectItem>
                            <SelectItem value="ANNUAL">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setAssignmentToEdit(null)
                setNewCommitmentDate(undefined)
                setNewGraceDays(undefined)
                setNewPayrollFrequencies([])
                setNewPaymentPeriod("MONTHLY")
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateCommitmentDate}
              disabled={
                isUpdating ||
                (assignmentToEdit?.process.name.toLowerCase().trim() === "nómina" ||
                assignmentToEdit?.process.name.toLowerCase().trim() === "nomina"
                  ? newPayrollFrequencies.length === 0
                  : !newCommitmentDate)
              }
            >
              {isUpdating ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Diálogo de confirmación para eliminar */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmDelete}
        title={title}
        description={description}
        confirmationWord={confirmationWord}
        isConfirming={isConfirming}
      />
      <UploadPaymentProofDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={uploadPaymentProofAndMarkAsPaid}
        isUploading={isUploading}
      />
    </div>
  )
}

