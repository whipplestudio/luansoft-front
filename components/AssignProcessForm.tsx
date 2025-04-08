"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Client, Process, ProcessAssignment } from "@/types"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select"

// Actualizar el esquema de validación para incluir mensajes de error en español
// Modificamos la validación de commitmentDate para que sea realmente opcional durante la entrada
// pero se valide antes de enviar el formulario
const assignProcessSchema = z.object({
  clientId: z.string().min(1, "El cliente es requerido"),
  processId: z.string().min(1, "El proceso es requerido"),
  commitmentDate: z
    .date({
      required_error: "La fecha de compromiso es requerida",
    })
    .optional(), // Hacemos que sea opcional para la validación inicial
  graceDays: z.number().min(0, "Los días de gracia no pueden ser negativos").default(0).optional(),
  payrollFrequencies: z.array(z.enum(["QUINCENAL", "SEMANAL"])).optional(),
  paymentPeriod: z.enum(["MONTHLY", "ANNUAL"]).optional(),
})

type AssignProcessFormData = z.infer<typeof assignProcessSchema>

interface AssignProcessFormProps {
  onSuccess: (data: any) => void
  onCancel: () => void
  clients: Client[]
  processes: Process[]
  existingAssignments: ProcessAssignment[]
}

export function AssignProcessForm({
  onSuccess,
  onCancel,
  clients,
  processes,
  existingAssignments,
}: AssignProcessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableProcesses, setAvailableProcesses] = useState<Process[]>(processes)
  const [isPayrollProcess, setIsPayrollProcess] = useState(false)
  const [clientSearchQuery, setClientSearchQuery] = useState("")
  const [processSearchQuery, setProcessSearchQuery] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false) // Estado para controlar la apertura del calendario

  const { toast } = useToast()

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm<AssignProcessFormData>({
    resolver: zodResolver(assignProcessSchema),
    defaultValues: {
      graceDays: 0,
      paymentPeriod: "MONTHLY", // Valor por defecto
    },
  })

  const selectedClientId = watch("clientId")
  const selectedProcessId = watch("processId")
  const commitmentDate = watch("commitmentDate")
  const paymentPeriod = watch("paymentPeriod")

  // Opciones para el período de pago
  const paymentPeriodOptions: SelectOption[] = [
    { label: "Mensual", value: "MONTHLY" },
    { label: "Anual", value: "ANNUAL" },
  ]

  // Filtrar clientes basados en la búsqueda
  const filteredClients = clients.filter((client) =>
    client.company.toLowerCase().includes(clientSearchQuery.toLowerCase()),
  )

  // Convertir clientes filtrados al formato de opciones para SearchableSelect
  const clientOptions: SelectOption[] = filteredClients.map((client) => ({
    label: client.company,
    value: client.id,
  }))

  // Filtrar procesos basados en la búsqueda
  const filteredProcesses = availableProcesses.filter((process) =>
    process.name.toLowerCase().includes(processSearchQuery.toLowerCase()),
  )

  // Convertir procesos al formato de opciones para SearchableSelect
  const processOptions: SelectOption[] = filteredProcesses.map((process) => {
    // Verificar si el proceso ya está asignado y activo para este cliente
    const isAlreadyAssigned = selectedClientId
      ? existingAssignments.some(
          (a) => a.clientId === selectedClientId && a.processId === process.id && a.status === "ACTIVE",
        )
      : false

    return {
      label: process.name,
      value: process.id,
      description: isAlreadyAssigned ? "Ya asignado" : undefined,
    }
  })

  // Actualizar procesos disponibles cuando cambia el cliente seleccionado
  useEffect(() => {
    // Mostrar todos los procesos sin filtrar por asignaciones existentes
    setAvailableProcesses(processes)

    // No es necesario resetear el proceso seleccionado ya que todos están disponibles
  }, [processes])

  // Añadir un nuevo useEffect para detectar si el proceso seleccionado es nómina
  useEffect(() => {
    if (selectedProcessId) {
      const process = processes.find((p) => p.id === selectedProcessId)
      if (process) {
        const isPayroll = process.name.toLowerCase() === "nómina" || process.name.toLowerCase() === "nomina"
        setIsPayrollProcess(isPayroll)

        // Resetear los campos según el tipo de proceso
        if (isPayroll) {
          setValue("commitmentDate", undefined)
          setValue("graceDays", undefined)
          setValue("payrollFrequencies", [])
        } else {
          setValue("payrollFrequencies", undefined)
          // No reseteamos la fecha de compromiso si ya existe
        }
      }
    }
  }, [selectedProcessId, processes, setValue])

  // Actualizar la función onSubmit para validar la fecha de compromiso
  const onSubmit = async (data: AssignProcessFormData) => {
    setIsSubmitting(true)

    try {
      let submissionData

      if (isPayrollProcess) {
        // Datos para proceso de nómina
        submissionData = {
          clientId: data.clientId,
          processId: data.processId,
          payrollFrequencies: data.payrollFrequencies,
        }
      } else {
        // Validar que la fecha de compromiso esté presente para procesos que no son de nómina
        if (!data.commitmentDate) {
          toast({
            title: "Error de validación",
            description: "La fecha de compromiso es requerida para este tipo de proceso.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        // Datos para otros procesos, ahora incluyendo paymentPeriod
        submissionData = {
          clientId: data.clientId,
          processId: data.processId,
          commitmentDate: data.commitmentDate ? format(data.commitmentDate, "yyyy-MM-dd") : undefined,
          graceDays: data.graceDays,
          paymentPeriod: data.paymentPeriod,
        }
      }

      // Pasar los datos al componente padre
      onSuccess(submissionData)

      setIsSubmitting(false)
      reset()
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      toast({
        title: "Error al asignar el proceso",
        description: "Hubo un problema al asignar el proceso. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // Función para manejar la selección de fecha
  const handleDateSelect = (date: Date | undefined) => {
    setValue("commitmentDate", date)
    setIsCalendarOpen(false) // Cerrar el calendario después de seleccionar
    trigger("commitmentDate") // Disparar validación
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="clientId">Cliente</Label>
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              options={clientOptions}
              selected={field.value}
              onChange={field.onChange}
              placeholder="Selecciona un cliente"
              showSearch={true}
              multiple={false}
              searchPlaceholder="Buscar cliente..."
              noResultsMessage="No se encontraron clientes"
              onSearchChange={setClientSearchQuery}
              searchValue={clientSearchQuery}
            />
          )}
        />
        {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>}
      </div>

      <div>
        <Label htmlFor="processId">Proceso</Label>
        <Controller
          name="processId"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              options={processOptions}
              selected={field.value}
              onChange={field.onChange}
              placeholder={!selectedClientId ? "Primero selecciona un cliente" : "Selecciona un proceso"}
              showSearch={true}
              multiple={false}
              searchPlaceholder="Buscar proceso..."
              noResultsMessage="No se encontraron procesos"
              isDisabled={!selectedClientId}
              disabledMessage="Primero selecciona un cliente"
              onSearchChange={setProcessSearchQuery}
            />
          )}
        />
        {errors.processId && <p className="text-red-500 text-sm mt-1">{errors.processId.message}</p>}
      </div>

      {isPayrollProcess ? (
        <div>
          <Label>Frecuencia de Nómina</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Controller
                name="payrollFrequencies"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <Checkbox
                    id="quincenal"
                    checked={field.value?.includes("QUINCENAL")}
                    onCheckedChange={(checked) => {
                      const currentValue = field.value || []
                      if (checked) {
                        field.onChange([...currentValue, "QUINCENAL"])
                      } else {
                        field.onChange(currentValue.filter((v) => v !== "QUINCENAL"))
                      }
                    }}
                  />
                )}
              />
              <Label htmlFor="quincenal">Quincenal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="payrollFrequencies"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <Checkbox
                    id="semanal"
                    checked={field.value?.includes("SEMANAL")}
                    onCheckedChange={(checked) => {
                      const currentValue = field.value || []
                      if (checked) {
                        field.onChange([...currentValue, "SEMANAL"])
                      } else {
                        field.onChange(currentValue.filter((v) => v !== "SEMANAL"))
                      }
                    }}
                  />
                )}
              />
              <Label htmlFor="semanal">Semanal</Label>
            </div>
          </div>
          {errors.payrollFrequencies && (
            <p className="text-red-500 text-sm mt-1">{errors.payrollFrequencies.message}</p>
          )}
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="commitmentDate">Fecha de Compromiso</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="commitmentDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !commitmentDate && "text-muted-foreground",
                    errors.commitmentDate && "border-red-500",
                  )}
                  onClick={() => setIsCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {commitmentDate ? format(commitmentDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={commitmentDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            {errors.commitmentDate && <p className="text-red-500 text-sm mt-1">{errors.commitmentDate.message}</p>}
            {!isPayrollProcess && !commitmentDate && selectedProcessId && (
              <p className="text-amber-500 text-sm mt-1">La fecha de compromiso es requerida</p>
            )}
          </div>

          <div>
            <Label htmlFor="graceDays">Días de Gracia</Label>
            <Controller
              name="graceDays"
              control={control}
              render={({ field }) => (
                <Input
                  id="graceDays"
                  type="number"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-full"
                />
              )}
            />
            {errors.graceDays && <p className="text-red-500 text-sm mt-1">{errors.graceDays.message}</p>}
          </div>

          <div>
            <Label htmlFor="paymentPeriod">Período de Pago</Label>
            <Controller
              name="paymentPeriod"
              control={control}
              defaultValue="MONTHLY"
              render={({ field }) => (
                <SearchableSelect
                  options={paymentPeriodOptions}
                  selected={field.value as string}
                  onChange={field.onChange}
                  placeholder="Seleccionar período"
                  showSearch={false} // Sin buscador
                  multiple={false} // Selección única
                  noResultsMessage="No se encontraron opciones"
                />
              )}
            />
            {errors.paymentPeriod && <p className="text-red-500 text-sm mt-1">{errors.paymentPeriod.message}</p>}
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Asignando...
            </>
          ) : (
            "Asignar Proceso"
          )}
        </Button>
      </div>
    </form>
  )
}
