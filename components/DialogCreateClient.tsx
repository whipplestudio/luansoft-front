"use client"

import type React from "react"

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
import { Loader2, Upload, X } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"

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
  contract: z.instanceof(File).optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface Client {
  id: string
  company: string
  type: "FISICA" | "MORAL"
  status: "ACTIVE" | "INACTIVE"
  regimenFiscalId?: string
  contractFile?: {
    id: string
    originalName: string
    size: number
  }
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [existingContractUrl, setExistingContractUrl] = useState<string | null>(null)
  const [isLoadingContract, setIsLoadingContract] = useState(false)
  const [hasExistingContract, setHasExistingContract] = useState(false)

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
      contract: undefined,
    },
  })

  // Fetch active tax regimes
  const fetchRegimenesFiscales = async () => {
    setIsLoadingRegimenes(true)
    try {
      const response = await axiosInstance.get("/regimenfiscal/activos")
      if (response.data.success) {
        setRegimenesFiscales(response.data.data)
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen válido")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo no puede ser mayor a 5MB")
        return
      }

      setSelectedFile(file)

      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    // Reset file input
    const fileInput = document.getElementById("contract") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchRegimenesFiscales()
    }
  }, [isOpen])

  const fetchExistingContractUrl = async (fileId: string) => {
    setIsLoadingContract(true)
    try {
      const response = await axiosInstance.get(`/file/${fileId}/download-url`)
      if (response.data.success) {
        setExistingContractUrl(response.data.data.url)
      } else {
        toast.error("Error al cargar el contrato existente")
      }
    } catch (error) {
      console.error("Error fetching contract URL:", error)
      toast.error("Error al cargar el contrato existente")
    } finally {
      setIsLoadingContract(false)
    }
  }

  useEffect(() => {
    if (isOpen && client) {
      reset({
        company: client.company,
        type: client.type,
        regimenFiscalId: client.regimenFiscalId || "",
      })

      // Verificar si el cliente tiene contrato
      if (client.contractFile && client.contractFile.id) {
        setHasExistingContract(true)
        fetchExistingContractUrl(client.contractFile.id)
      } else {
        setHasExistingContract(false)
        setExistingContractUrl(null)
      }
    } else if (isOpen) {
      reset({
        company: "",
        type: "FISICA",
        regimenFiscalId: "",
        contract: undefined,
      })
      setHasExistingContract(false)
      setExistingContractUrl(null)
    }
  }, [isOpen, client, reset])

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      // Crear FormData para enviar archivo
      const formData = new FormData()
      formData.append("company", data.company)
      formData.append("type", data.type)
      formData.append("regimenFiscalId", data.regimenFiscalId)

      // Añadir archivo si existe
      if (selectedFile) {
        formData.append("contract", selectedFile)
      }

      let response
      if (client) {
        // Editar cliente existente
        const changedFields = Object.keys(dirtyFields).reduce(
          (acc, key) => {
            const typedKey = key as keyof ClientFormData
            const value = data[typedKey]
            if (typedKey === "type") {
              if (value === "FISICA" || value === "MORAL") {
                acc[typedKey] = value
              }
            } else if (value !== undefined && typedKey !== "contract") {
              acc[typedKey] = value
            }
            return acc
          },
          {} as Partial<ClientFormData>,
        )

        // Para edición, usar JSON si no hay archivo nuevo
        if (selectedFile) {
          Object.keys(changedFields).forEach((key) => {
            if (key !== "contract") {
              formData.append(key, changedFields[key as keyof typeof changedFields] as string)
            }
          })
          response = await axiosInstance.patch(`/client/${client.id}`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })
        } else {
          response = await axiosInstance.patch(`/client/${client.id}`, changedFields, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        }
      } else {
        // Crear nuevo cliente
        response = await axiosInstance.post("/client", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
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
      contract: undefined,
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setExistingContractUrl(null)
    setHasExistingContract(false)
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
          <div>
            <Label htmlFor="contract">Contrato (Opcional)</Label>
            <div className="space-y-2">
              {/* Mostrar contrato existente si existe */}
              {hasExistingContract && !selectedFile && (
                <div className="space-y-2">
                  <p className="text-sm text-blue-600 font-medium">Contrato actual:</p>
                  {isLoadingContract ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando contrato...</span>
                    </div>
                  ) : existingContractUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={existingContractUrl || "/placeholder.svg"}
                        alt="Contrato actual"
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=128&width=128&text=Error+al+cargar"
                        }}
                      />
                      <div className="mt-2 text-xs text-gray-600">
                        <p>{client?.contractFile?.originalName}</p>
                        <p>({((client?.contractFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Error al cargar el contrato</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Selecciona un nuevo archivo para reemplazar el contrato actual
                  </p>
                </div>
              )}

              <Input
                id="contract"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB</p>

              {/* Mostrar preview del nuevo archivo seleccionado */}
              {previewUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-green-600 font-medium">Nuevo contrato:</p>
                  <div className="relative inline-block">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview del nuevo contrato"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeFile}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Upload className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
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
