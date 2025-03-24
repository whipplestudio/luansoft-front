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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Primero, actualizar la interfaz AssignProcessFormData para incluir el nuevo campo paymentPeriod
const assignProcessSchema = z.object({
  clientId: z.string().min(1, "El cliente es requerido"),
  processId: z.string().min(1, "El proceso es requerido"),
  commitmentDate: z
    .date({
      required_error: "La fecha de compromiso es requerida",
    })
    .optional(),
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
  const [openClient, setOpenClient] = useState(false)
  const [openProcess, setOpenProcess] = useState(false)
  const [isPayrollProcess, setIsPayrollProcess] = useState(false)

  const [open, setOpen] = useState(false)

  const { toast } = useToast()

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<AssignProcessFormData>({
    resolver: zodResolver(assignProcessSchema),
    defaultValues: {
      graceDays: 0,
    },
  })

  const selectedClientId = watch("clientId")

  // Actualizar procesos disponibles cuando cambia el cliente seleccionado
  useEffect(() => {
    // Mostrar todos los procesos sin filtrar por asignaciones existentes
    setAvailableProcesses(processes)

    // No es necesario resetear el proceso seleccionado ya que todos están disponibles
  }, [processes])

  // Añadir un nuevo useEffect para detectar si el proceso seleccionado es nómina
  useEffect(() => {
    const selectedProcess = watch("processId")
    if (selectedProcess) {
      const process = processes.find((p) => p.id === selectedProcess)
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
        }
      }
    }
  }, [watch("processId"), processes, setValue])

  // Actualizar la función onSubmit para incluir el paymentPeriod en los datos enviados
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="clientId">Cliente</Label>
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <Popover open={openClient} onOpenChange={setOpenClient}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openClient} className="w-full justify-between">
                  {field.value ? clients.find((client) => client.id === field.value)?.company : "Selecciona un cliente"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          onSelect={() => {
                            field.onChange(client.id)
                            setOpenClient(false)
                          }}
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
          )}
        />
        {errors.clientId && <p className="text-red-500 text-sm">{errors.clientId.message}</p>}
      </div>

      <div>
        <Label htmlFor="processId">Proceso</Label>
        <Controller
          name="processId"
          control={control}
          render={({ field }) => (
            <Popover open={openProcess} onOpenChange={setOpenProcess}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openProcess}
                  className="w-full justify-between"
                  disabled={!selectedClientId}
                >
                  {field.value
                    ? availableProcesses.find((process) => process.id === field.value)?.name
                    : !selectedClientId
                      ? "Primero selecciona un cliente"
                      : "Selecciona un proceso"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar proceso..." />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>No se encontraron procesos.</CommandEmpty>
                    <CommandGroup>
                      {availableProcesses.map((process) => {
                        // Verificar si el proceso ya está asignado y activo para este cliente
                        const isAlreadyAssigned = selectedClientId
                          ? existingAssignments.some(
                              (a) =>
                                a.clientId === selectedClientId && a.processId === process.id && a.status === "ACTIVE",
                            )
                          : false

                        return (
                          <CommandItem
                            key={process.id}
                            onSelect={() => {
                              field.onChange(process.id)
                              setOpenProcess(false)
                            }}
                            className={`cursor-pointer ${isAlreadyAssigned ? "flex justify-between items-center" : ""}`}
                          >
                            <span>{process.name}</span>
                            {isAlreadyAssigned && (
                              <span className="text-xs text-amber-500 font-medium ml-2">(Ya asignado)</span>
                            )}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.processId && <p className="text-red-500 text-sm">{errors.processId.message}</p>}
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
          {errors.payrollFrequencies && <p className="text-red-500 text-sm">{errors.payrollFrequencies.message}</p>}
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="commitmentDate">Fecha de Compromiso</Label>
            <Controller
              name="commitmentDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es} />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.commitmentDate && <p className="text-red-500 text-sm">{errors.commitmentDate.message}</p>}
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
            {errors.graceDays && <p className="text-red-500 text-sm">{errors.graceDays.message}</p>}
          </div>

          <div>
            <Label htmlFor="paymentPeriod">Período de Pago</Label>
            <Controller
              name="paymentPeriod"
              control={control}
              defaultValue="MONTHLY"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="ANNUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentPeriod && <p className="text-red-500 text-sm">{errors.paymentPeriod.message}</p>}
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

