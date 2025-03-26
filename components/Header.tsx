"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle, User, LogOut, Settings } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User as UserType } from "@/types"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"

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

  return (
    <header className="sticky top-0 z-50 flex h-[60px] w-full items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {userRole !== "dashboard" && userRole !== "cliente" && <SidebarTrigger />}
        <Logo variant="horizontal" color="black" width={150} height={40} className="h-20 w-auto" />
      </div>
      <div className="flex items-center gap-4">
        {userRole !== "cliente" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-primary-green">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gold" />}
                <span className="sr-only">Notificaciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <DropdownMenuItem>No hay notificaciones</DropdownMenuItem>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex items-start justify-between p-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            notification.severity === "high"
                              ? "bg-destructive"
                              : notification.severity === "medium"
                                ? "bg-gold"
                                : "bg-primary-green"
                          }`}
                        />
                        <p className="font-medium">{notification.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.date), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="h-8 w-8 text-primary-green"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="sr-only">Marcar como leída</span>
                      </Button>
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user.avatar || `/placeholder.svg?height=32&width=32`} alt={user.name} />
              <AvatarFallback className="bg-primary-green text-white">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userRole !== "dashboard" && (
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
            )}
            {userRole !== "dashboard" && userRole !== "cliente" && (
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
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

