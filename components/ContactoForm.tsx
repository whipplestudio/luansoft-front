"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Contacto } from "@/types"

// Esquema común para los campos compartidos
const commonContactoSchema = {
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  phone: z
    .string()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true
        return /^\d{10}$/.test(val)
      },
      { message: "El teléfono debe tener exactamente 10 dígitos numéricos" },
    )
    .optional()
    .transform((val) => (val === "" ? null : val)),
}

// Para ambos casos definimos password como opcional en el esquema; luego usaremos superRefine
// para exigir la contraseña cuando se crea un nuevo contacto.
const newContactoSchema = z
  .object({
    ...commonContactoSchema,
    // Declaramos password como opcional para que el schema retorne la misma forma que el de edición.
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.password || data.password === "") {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "La contraseña es requerida",
      })
      return
    }
    if (data.password.length < 8) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.too_small,
        message: "La contraseña debe tener al menos 8 caracteres",
        minimum: 8,
        inclusive: true,
        type: "string",
      })
    }
    if (!/[A-Z]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "La contraseña debe contener al menos una letra mayúscula",
      })
    }
    if (!/[a-z]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "La contraseña debe contener al menos una letra minúscula",
      })
    }
    if (!/[0-9]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message: "La contraseña debe contener al menos un número",
      })
    }
    if (!/[^A-Za-z0-9]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: z.ZodIssueCode.custom,
        message:
          "La contraseña debe contener al menos un carácter especial",
      })
    }
  })

const editContactoSchema = z
  .object({
    ...commonContactoSchema,
    // En edición la contraseña es opcional y solo se valida si se ingresa algún valor.
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password !== "") {
      if (data.password.length < 8) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.too_small,
          message: "La contraseña debe tener al menos 8 caracteres",
          minimum: 8,
          inclusive: true,
          type: "string",
        })
      }
      if (!/[A-Z]/.test(data.password)) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message: "La contraseña debe contener al menos una letra mayúscula",
        })
      }
      if (!/[a-z]/.test(data.password)) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message: "La contraseña debe contener al menos una letra minúscula",
        })
      }
      if (!/[0-9]/.test(data.password)) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message: "La contraseña debe contener al menos un número",
        })
      }
      if (!/[^A-Za-z0-9]/.test(data.password)) {
        ctx.addIssue({
          path: ["password"],
          code: z.ZodIssueCode.custom,
          message:
            "La contraseña debe contener al menos un carácter especial",
        })
      }
    }
  })

// Ambos esquemas tienen la misma forma (password es opcional), por lo que podemos usar cualquiera
// para definir el tipo de valores del formulario.
export type ContactoFormValues = z.infer<typeof editContactoSchema>

interface ContactoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ContactoFormValues, originalData?: Contacto) => Promise<void>
  contacto?: Contacto
  clients: { id: string; company: string }[]
  isSubmitting?: boolean
}

export function ContactoForm({
  isOpen,
  onClose,
  onSubmit,
  contacto,
  clients,
  isSubmitting = false,
}: ContactoFormProps) {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [originalValues, setOriginalValues] = useState<ContactoFormValues | null>(null)

  // Seleccionar el esquema de validación en función de si se está editando o creando
  const formSchema = contacto ? editContactoSchema : newContactoSchema

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<ContactoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  })

  // Cargar los datos del contacto cuando cambie la propiedad "contacto"
  useEffect(() => {
    if (contacto) {
      const values = {
        firstName: contacto.firstName || "",
        lastName: contacto.lastName || "",
        email: contacto.email || "",
        phone: contacto.phone || "",
        password: "", // No se carga la contraseña en edición
      }
      setOriginalValues(values)
      reset(values)
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
      })
      setOriginalValues(null)
    }
  }, [contacto, reset, isOpen])

  // Manejar el envío del formulario
  const handleFormSubmit = async (data: ContactoFormValues) => {
    try {
      if (contacto) {
        // Al editar, descartamos el campo "password" (aunque se ingrese) y enviamos solo los campos modificados.
        const { password, ...dataWithoutPassword } = data
        const changedFields: Partial<ContactoFormValues> = {}

        if (originalValues) {
          Object.keys(dataWithoutPassword).forEach((key) => {
            const typedKey = key as keyof typeof dataWithoutPassword
            if (dataWithoutPassword[typedKey] !== originalValues[typedKey]) {
              changedFields[typedKey] = dataWithoutPassword[typedKey] ?? undefined
            }
          })
        }

        if (Object.keys(changedFields).length > 0) {
          await onSubmit(changedFields as ContactoFormValues, contacto)
        } else {
          toast({
            title: "Sin cambios",
            description: "No se detectaron cambios en los datos del contacto",
          })
          handleClose()
        }
      } else {
        // Para un nuevo contacto se envían todos los campos, incluida la contraseña validada.
        await onSubmit(data, undefined)
      }
    } catch (error) {
      console.error("Error al guardar contacto:", error)
    }
  }

  // Función para cerrar el diálogo y resetear el formulario
  const handleClose = () => {
    reset()
    setOriginalValues(null)
    onClose()
  }

  // Alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Manejar el formato del campo teléfono (solo números y hasta 10 dígitos)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    const truncatedValue = value.slice(0, 10)
    setValue("phone", truncatedValue, { shouldDirty: true })
  }

  const phoneValue = watch("phone")

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{contacto ? "Editar Contacto" : "Nuevo Contacto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          {/* Se muestra el campo de contraseña solo al crear un contacto */}
          {!contacto && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              <p className="text-xs text-gray-500">
                La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              {...register("phone")}
              onChange={handlePhoneChange}
              value={phoneValue || ""}
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
              className={phoneValue && phoneValue.length > 0 && phoneValue.length < 10 ? "border-orange-500" : ""}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            <p
              className={`text-xs ${
                phoneValue && phoneValue.length > 0 && phoneValue.length < 10 ? "text-orange-500" : "text-gray-500"
              }`}
            >
              {!phoneValue
                ? "Campo opcional. Si lo llena, debe tener 10 dígitos."
                : phoneValue.length < 10
                ? `${phoneValue.length}/10 dígitos (faltan ${10 - phoneValue.length})`
                : "✓ 10 dígitos completos"}
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {contacto ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
