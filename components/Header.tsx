"use client"

import { useState, useEffect } from "react"
import { LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User as UserType } from "@/types"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"

// Al inicio del archivo, después de las importaciones, importamos nuestras utilidades de permisos:
import { hasPermission, type RoleType } from "@/lib/permissions"

type Notification = {
  id: string
  title: string
  description: string
  date: string
  read: boolean
  severity: "low" | "medium" | "high"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Entregable pendiente",
    description: "El cliente A tiene un entregable que vence mañana",
    date: "2025-01-28T10:00:00Z",
    read: false,
    severity: "high",
  },
  {
    id: "2",
    title: "Nuevo cliente asignado",
    description: "Se te ha asignado el cliente B para gestión fiscal",
    date: "2025-01-27T15:30:00Z",
    read: false,
    severity: "medium",
  },
  {
    id: "3",
    title: "Actualización de sistema",
    description: "Nueva versión del CMS disponible. Por favor, actualiza.",
    date: "2025-01-26T09:00:00Z",
    read: true,
    severity: "low",
  },
]

export function Header({ userRole }: { userRole: string | null }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  if (!user) return null

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  // Reemplazar la lógica de mostrar/ocultar el sidebar basada en el rol
  const showSidebar = hasPermission(userRole as RoleType, "dashboard", "view")

  return (
    <header className="sticky top-0 z-50 flex h-[60px] w-full items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {showSidebar && <SidebarTrigger />}
        <Logo variant="horizontal" color="black" width={150} height={40} className="h-20 w-auto" />
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarFallback className="bg-primary-green text-white">
                {user.name
                  .split(" ")
                  .map((name) => name.charAt(0))
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
