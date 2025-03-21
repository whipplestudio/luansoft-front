"use client"

import { useState, useEffect, useCallback } from "react"
import { Geist } from "next/font/google"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/Header"
import { LottieLoader } from "@/components/LottieLoader"
import { useLoading } from "@/hooks/useLoading"
import type { User } from "@/types"
import { usePathname, useRouter } from "next/navigation"
import type React from "react" // Added import for React

const geist = Geist({
  subsets: ["latin"],
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
    const { auth, role } = checkAuth()
    setIsAuthenticated(auth)
    setUserRole(role)

    if (!auth && pathname !== "/login") {
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

  if (!isAuthenticated && pathname !== "/login") {
    return null
  }

  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={geist.className}>
        {isAuthenticated || pathname === "/login" ? (
          <>
            {isAuthenticated && pathname !== "/login" ? (
              <SidebarProvider>
                <div className="group/sidebar-wrapper flex min-h-screen w-full">
                  {userRole === "admin" && <AppSidebar userRole={userRole} />}
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

