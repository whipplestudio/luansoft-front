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
import axios from "axios"
import { Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { getActiveRegimenesFiscales } from "@/src/regimen-fiscal/regimen-fiscal.service"

// Define the RegimenFiscal interface
interface RegimenFiscal {
  id: string
  nombre: string
  descripcion: string
  status: "ACTIVE" | "INACTIVE"
}

const clientSchema = z.object({
  company: z.string().min(1, "La empresa es requerida"),
  type: z.enum(["FISICA", "MORAL"]),
  regimenFiscalId: z.string().min(1, "El régimen fiscal es requerido"),
})

type ClientFormData = z.infer<typeof clientSchema>

interface Client {
  id: string
  company: string
  type: "FISICA" | "MORAL"
  status: "ACTIVE" | "INACTIVE"
  regimenFiscalId?: string
}

interface DialogCreateClientProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSuccess: () => void
}

export function DialogCreateClient({ isOpen, onOpenChange, client, onSuccess }: DialogCreateClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [regimenesFiscales, setRegimenesFiscales] = useState<RegimenFiscal[]>([])
  const [isLoadingRegimenes, setIsLoadingRegimenes] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company: "",
      type: "FISICA",
      regimenFiscalId: "",
    },
  })

  // Fetch active tax regimes
  const fetchRegimenesFiscales = async () => {
    setIsLoadingRegimenes(true)
    try {
      const response = await getActiveRegimenesFiscales()
      if (response.success) {
        setRegimenesFiscales(response.data)
      } else {
        toast.error("Error al cargar los regímenes fiscales")
      }
    } catch (error) {
      console.error("Error fetching regimenes fiscales:", error)
      toast.error("Error al cargar los regímenes fiscales")
    } finally {
      setIsLoadingRegimenes(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchRegimenesFiscales()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && client) {
      reset({
        company: client.company,
        type: client.type,
        regimenFiscalId: client.regimenFiscalId || "",
      })
    } else if (isOpen) {
      reset({
        company: "",
        type: "FISICA",
        regimenFiscalId: "",
      })
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
            const typedKey = key as keyof ClientFormData // Aseguramos que key es una clave válida

            const value = data[typedKey]
            if (typedKey === "type") {
              // Validamos que el valor de "type" sea uno de los valores permitidos
              if (value === "FISICA" || value === "MORAL") {
                acc[typedKey] = value
              }
            } else if (value !== undefined) {
              acc[typedKey] = value
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
      if (axios.isAxiosError(error) && error.response) {
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
      company: "",
      type: "FISICA",
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
            <Label htmlFor="company">Empresa</Label>
            <Controller name="company" control={control} render={({ field }) => <Input {...field} />} />
            {errors.company && <p className="text-red-500 text-sm">{errors.company.message}</p>}
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
          <div>
            <Label htmlFor="regimenFiscalId">Régimen Fiscal</Label>
            <Controller
              name="regimenFiscalId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  placeholder="Seleccionar régimen fiscal"
                  // isLoading={isLoadingRegimenes} // Removed as it's not supported
                  options={regimenesFiscales.map((regimen) => ({
                    label: regimen.nombre,
                    value: regimen.id,
                    description: regimen.descripcion,
                  }))}
                  selected={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.regimenFiscalId && <p className="text-red-500 text-sm">{errors.regimenFiscalId.message}</p>}
          </div>
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
