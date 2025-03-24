"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import axiosInstance from "@/api/config"
import { Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Primero, actualizo el esquema de validación para incluir el regimenFiscalId
const clientSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  company: z.string().min(1, "La empresa es requerida"),
  email: z.string().email("Correo electrónico inválido"),
  type: z.enum(["FISICA", "MORAL"]),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
  regimenFiscalId: z.string().min(1, "El régimen fiscal es requerido"),
})

// Actualizo la interfaz ClientFormData para incluir el nuevo campo
type ClientFormData = z.infer<typeof clientSchema>

interface Client {
  id: string
  firstName: string
  lastName: string
  company: string
  email: string
  type: "FISICA" | "MORAL"
  status: "ACTIVE" | "INACTIVE"
  regimenFiscalId: string
}

interface DialogCreateClientProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSuccess: () => void
}

export function DialogCreateClient({ isOpen, onOpenChange, client, onSuccess }: DialogCreateClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Añado el estado para almacenar los regímenes fiscales
  const [regimenesFiscales, setRegimenesFiscales] = useState<Array<{ id: string; nombre: string }>>([])
  // Añadir un estado para controlar el popover

  // Añadir este estado después de los otros estados en el componente
  const [open, setOpen] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      type: "FISICA",
      password: "",
      regimenFiscalId: "",
    },
  })

  // Añado la función para obtener los regímenes fiscales
  const fetchRegimenesFiscales = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) throw new Error("No se encontró el token de autenticación")

      const response = await axiosInstance.get("/regimenfiscal/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setRegimenesFiscales(response.data.data.data)
      } else {
        throw new Error(response.data.message || "Error al obtener los regímenes fiscales")
      }
    } catch (error) {
      console.error("Error fetching regímenes fiscales:", error)
      toast.error("Error al cargar los regímenes fiscales")
    }
  }

  // Modifico el useEffect para cargar los regímenes fiscales cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      fetchRegimenesFiscales()

      if (client) {
        reset({
          firstName: client.firstName,
          lastName: client.lastName,
          company: client.company,
          email: client.email,
          type: client.type,
          regimenFiscalId: client.regimenFiscalId || "", // Añado el regimenFiscalId
        })
      } else {
        reset({
          firstName: "",
          lastName: "",
          company: "",
          email: "",
          type: "FISICA",
          password: "",
          regimenFiscalId: "", // Añado el regimenFiscalId con valor por defecto vacío
        })
      }
    }
  }, [isOpen, client, reset])

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      let response
      if (client) {
        // Editar cliente existente
        const changedFields = Object.keys(dirtyFields).reduce(
          (acc, key) => {
            if (key !== "password") {
              acc[key] = data[key]
            }
            return acc
          },
          {} as Partial<ClientFormData>,
        )

        response = await axiosInstance.patch(`/client/${client.id}`, changedFields, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } else {
        // Crear nuevo cliente
        response = await axiosInstance.post("/client", data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }

      if (response.data.success) {
        toast.success(client ? "Cliente actualizado exitosamente" : "Cliente creado exitosamente")
        onSuccess()
        handleClose()
      } else {
        throw new Error(response.data.message || "Error al procesar la solicitud")
      }
    } catch (error) {
      console.error("Error:", error)
      if (error.response) {
        const { status, data } = error.response
        if (status === 404) {
          toast.error("Cliente no encontrado")
        } else if (status === 409) {
          toast.error("El correo electrónico ya está registrado")
        } else {
          toast.error(data.message || "Error al procesar la solicitud")
        }
      } else {
        toast.error("Error de conexión. Por favor, intente nuevamente")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset({
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      type: "FISICA",
      password: "",
      regimenFiscalId: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Crear Nuevo Cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Controller name="firstName" control={control} render={({ field }) => <Input {...field} />} />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Controller name="lastName" control={control} render={({ field }) => <Input {...field} />} />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
          </div>
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Controller name="company" control={control} render={({ field }) => <Input {...field} />} />
            {errors.company && <p className="text-red-500 text-sm">{errors.company.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Controller name="email" control={control} render={({ field }) => <Input {...field} type="email" />} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FISICA">Persona Física</SelectItem>
                    <SelectItem value="MORAL">Persona Moral</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>
          {/* Añado el select de régimen fiscal al formulario, justo antes del campo de contraseña */}
          {/* Reemplazar el Select de régimen fiscal actual con este componente con buscador */}
          <div>
            <Label htmlFor="regimenFiscalId">Régimen Fiscal</Label>
            <Controller
              name="regimenFiscalId"
              control={control}
              render={({ field }) => (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                      {field.value
                        ? regimenesFiscales.find((regimen) => regimen.id === field.value)?.nombre ||
                          "Seleccionar régimen fiscal"
                        : "Seleccionar régimen fiscal"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 max-h-[300px] overflow-hidden">
                    <Command className="h-full">
                      <CommandInput placeholder="Buscar régimen fiscal..." />
                      <CommandList className="max-h-[calc(300px-40px)] overflow-y-auto">
                        <CommandEmpty>No se encontraron regímenes fiscales.</CommandEmpty>
                        <CommandGroup>
                          {regimenesFiscales.map((regimen) => (
                            <CommandItem
                              key={regimen.id}
                              value={regimen.id}
                              onSelect={() => {
                                field.onChange(regimen.id)
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", field.value === regimen.id ? "opacity-100" : "opacity-0")}
                              />
                              {regimen.nombre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.regimenFiscalId && <p className="text-red-500 text-sm">{errors.regimenFiscalId.message}</p>}
          </div>
          {!client && (
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Controller
                name="password"
                control={control}
                rules={{ required: !client }}
                render={({ field }) => <Input {...field} type="password" />}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {client ? "Actualizando..." : "Creando..."}
              </>
            ) : client ? (
              "Actualizar Cliente"
            ) : (
              "Crear Cliente"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

