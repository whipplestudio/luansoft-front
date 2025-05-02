"use client"

import { useState, useEffect, useCallback } from "react"
import { Jost } from "next/font/google"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/Header"
import { LottieLoader } from "@/components/LottieLoader"
import { useLoading } from "@/hooks/useLoading"
import type { User } from "@/types"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"

// Load Jost font with all the weights we need
const jost = Jost({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-jost",
})

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isLoading = useLoading()
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const checkAuth = useCallback(() => {
    const auth = localStorage.getItem("isAuthenticated")
    const role = localStorage.getItem("userRole")
    return { auth: auth === "true", role }
  }, [])

  useEffect(() => {
    // Verificar si hay un usuario temporal (que debe cambiar su contraseña)
    const tempUser = localStorage.getItem("tempUser")
    if (tempUser && pathname !== "/cambiar-contrasena") {
      // Si hay un usuario temporal y no estamos en la página de cambio de contraseña, redirigir
      router.push("/cambiar-contrasena")
      return
    }

    const { auth, role } = checkAuth()
    setIsAuthenticated(auth)
    setUserRole(role)

    // Lista de rutas públicas que no requieren autenticación
    const publicRoutes = ["/login", "/cambiar-contrasena", "/reset-password"]

    // Verificar si la ruta actual es pública
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    if (!auth && !isPublicRoute) {
      router.push("/login")
    } else if (auth && pathname === "/login") {
      router.push("/")
    }
  }, [pathname, router, checkAuth])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Lista de rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/cambiar-contrasena", "/reset-password"]

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (!isAuthenticated && !isPublicRoute) {
    return null
  }

  const showSideBar = userRole !== "dashboard"

  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${jost.className} ${jost.variable}`}>
        {isAuthenticated || isPublicRoute ? (
          <>
            {isAuthenticated && !isPublicRoute ? (
              <SidebarProvider>
                <div className="group/sidebar-wrapper flex min-h-screen w-full">
                  {showSideBar && <AppSidebar userRole={userRole} />}
                  <div className="flex w-full flex-col">
                    <Header userRole={userRole} />
                    <main className="flex-1 overflow-y-auto p-4 relative">
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 bg-background/80">
                          <LottieLoader />
                        </div>
                      )}
                      <div key={pathname}>{children}</div>
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            ) : (
              children
            )}
          </>
        ) : null}
      </body>
    </html>
  )
}
