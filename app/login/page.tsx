"use client"

import { useState } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

type UserRole = "ADMINISTRADOR" | "CONTADOR" | "CONTACTO" | "DASHBOARD"

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetEmailLoading, setResetEmailLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const resetPasswordForm = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({
        email: z.string().email("Correo electrónico inválido"),
      }),
    ),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post("/auth/login", data)

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data

        // Verificar si el usuario debe cambiar su contraseña
        if (user.mustChangePassword) {
          // Guardar datos del usuario temporalmente
          localStorage.setItem("tempUser", JSON.stringify(user))

          // Redirigir a la página de cambio de contraseña
          router.push("/cambiar-contrasena")
          return
        }

        // Map the API role to our internal role format
        const roleMapping: Record<UserRole, string> = {
          ADMINISTRADOR: "admin",
          CONTADOR: "contador",
          CONTACTO: "contacto",
          DASHBOARD: "dashboard",
        }

        const mappedRole = roleMapping[user.role as UserRole] || "contacto"

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

        router.push("/")
      } else {
        throw new Error(response.data.message || "Error de inicio de sesión")
      }
    } catch (error: any) {
      console.error("Error durante el inicio de sesión:", error)
      toast.error(error.response?.data?.message || "Credenciales inválidas")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleResetPasswordRequest = async (data: { email: string }) => {
    setResetEmailLoading(true)
    try {
      const response = await axiosInstance.post("/auth/request-reset-with-token", {
        email: data.email,
      })

      if (response.data.success) {
        setResetEmailSent(true)
        toast.success("Se ha enviado un correo con instrucciones para restablecer tu contraseña")
      } else {
        throw new Error(response.data.message || "Error al solicitar restablecimiento de contraseña")
      }
    } catch (error: any) {
      console.error("Error al solicitar restablecimiento:", error)
      toast.error(error.response?.data?.message || "No se pudo enviar el correo de recuperación")
    } finally {
      setResetEmailLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-gray">
      <Card className="w-full max-w-md border-primary-green/20 shadow-lg">
        <CardHeader className="bg-primary-green text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <Logo variant="vertical" color="white" width={300} height={320} />
          </div>
          <CardTitle className="text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-light-gray text-center">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" {...register("email")} className="border-primary-green/20" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
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
            <div className="text-right">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-sm text-primary-green hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Button type="submit" className="w-full bg-primary-green hover:bg-primary-green/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              {!resetEmailSent
                ? "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña."
                : "Hemos enviado un correo con instrucciones para restablecer tu contraseña."}
            </DialogDescription>
          </DialogHeader>

          {!resetEmailSent ? (
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(handleResetPasswordRequest)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="correo@ejemplo.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={resetEmailLoading}>
                  {resetEmailLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar correo de recuperación"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center py-4">
              <p className="mb-4">Revisa tu bandeja de entrada y sigue las instrucciones del correo.</p>
              <Button
                onClick={() => {
                  setForgotPasswordOpen(false)
                  setResetEmailSent(false)
                  resetPasswordForm.reset()
                }}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
