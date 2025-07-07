"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import axiosInstance from "@/api/config"
import { Logo } from "@/components/Logo"
import { Eye, EyeOff, Loader2 } from "lucide-react"

// Esquema de validación para el formulario de cambio de contraseña
const passwordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(8, "La confirmación de contraseña debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // Validar que la contraseña tenga al menos una letra mayúscula
      return /[A-Z]/.test(data.password)
    },
    {
      message: "La contraseña debe contener al menos una letra mayúscula",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      // Validar que la contraseña tenga al menos una letra minúscula
      return /[a-z]/.test(data.password)
    },
    {
      message: "La contraseña debe contener al menos una letra minúscula",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      // Validar que la contraseña tenga al menos un número
      return /[0-9]/.test(data.password)
    },
    {
      message: "La contraseña debe contener al menos un número",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      // Validar que la contraseña tenga al menos un carácter especial
      return /[^A-Za-z0-9]/.test(data.password)
    },
    {
      message: "La contraseña debe contener al menos un carácter especial",
      path: ["password"],
    },
  )

type PasswordFormData = z.infer<typeof passwordSchema>

export default function CambiarContrasenaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    // Verificar si hay datos de usuario en localStorage
    const storedUser = localStorage.getItem("tempUser")
    if (!storedUser) {
      // Si no hay datos de usuario, redirigir al login
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(storedUser)
      setUserData(user)
    } catch (error) {
      console.error("Error al parsear los datos del usuario:", error)
      router.push("/login")
    }
  }, [router])

  const onSubmit = async (data: PasswordFormData) => {
    if (!userData) {
      toast.error("No se encontraron datos del usuario")
      return
    }

    setIsLoading(true)
    try {
      // Enviar solicitud para cambiar la contraseña usando PATCH y la ruta correcta
      const response = await axiosInstance.patch(`/auth/change-password/${userData.id}`, {
        newPassword: data.password,
      })

      if (response.data.success) {
        toast.success("Contraseña cambiada exitosamente")

        // Intentar iniciar sesión automáticamente con las nuevas credenciales
        const loginResponse = await axiosInstance.post("/auth/login", {
          email: userData.email,
          password: data.password,
        })

        if (loginResponse.data.success) {
          const { accessToken, refreshToken, user } = loginResponse.data.data

          // Mapear el rol de la API a nuestro formato interno
          const roleMapping: Record<string, string> = {
            ADMINISTRADOR: "admin",
            CONTADOR: "contador",
            CONTACTO: "contacto",
            DASHBOARD: "dashboard",
          }

          const mappedRole = roleMapping[user.role] || "contacto"

          // Guardar los datos de autenticación
          localStorage.setItem("accessToken", accessToken)
          localStorage.setItem("refreshToken", refreshToken)
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...user,
              name: `${user.firstName} ${user.lastName}`,
              role: mappedRole,
            }),
          )
          localStorage.setItem("isAuthenticated", "true")
          localStorage.setItem("userRole", mappedRole)

          // Eliminar los datos temporales
          localStorage.removeItem("tempUser")

          // Redirigir al dashboard
          router.push("/")
        } else {
          throw new Error(loginResponse.data.message || "Error al iniciar sesión después de cambiar la contraseña")
        }
      } else {
        throw new Error(response.data.message || "Error al cambiar la contraseña")
      }
    } catch (error: any) {
      console.error("Error durante el cambio de contraseña:", error)
      toast.error(error.response?.data?.message || "Error al cambiar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-gray">
        <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-gray">
      <Card className="w-full max-w-md border-primary-green/20 shadow-lg">
        <CardHeader className="bg-primary-green text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <Logo variant="vertical" color="white" width={300} height={320} />
          </div>
          <CardTitle className="text-center">Cambiar contraseña</CardTitle>
          <CardDescription className="text-light-gray text-center">
            Por razones de seguridad, debes cambiar tu contraseña antes de continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="border-primary-green/20 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="border-primary-green/20 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>La contraseña debe cumplir con los siguientes requisitos:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Al menos 8 caracteres</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos una letra minúscula</li>
                <li>Al menos un número</li>
                <li>Al menos un carácter especial</li>
              </ul>
            </div>
            <Button type="submit" className="w-full bg-primary-green hover:bg-primary-green/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando contraseña...
                </>
              ) : (
                "Cambiar contraseña"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
