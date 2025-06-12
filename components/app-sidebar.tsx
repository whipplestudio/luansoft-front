"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Calculator,
  UserPlus,
  FileText,
  ClipboardList,
  History,
  Contact,
} from "lucide-react"
import { hasPermission, type ResourceType, type RoleType } from "@/lib/permissions"
// Importamos la versión desde package.json
import packageInfo from "../package.json"

// Estructura completa de los elementos del sidebar con información de permisos
const sidebarItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    resource: "dashboard" as ResourceType,
  },
  {
    title: "Usuarios",
    url: "/usuarios",
    icon: Users,
    resource: "usuarios" as ResourceType,
  },
  {
    title: "Contadores",
    url: "/contadores",
    icon: Calculator,
    resource: "contadores" as ResourceType,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: UserCircle,
    resource: "clientes" as ResourceType,
  },
  {
    title: "Contactos",
    url: "/contactos",
    icon: Contact,
    resource: "contactos" as ResourceType,
  },
  {
    title: "Asignación de Contadores",
    url: "/asignacion-contadores",
    icon: UserPlus,
    resource: "asignacion-contadores" as ResourceType,
  },
  {
    title: "Asignación de Contactos",
    url: "/asignacion-contactos",
    icon: UserPlus,
    resource: "asignacion-contactos" as ResourceType,
  },
  {
    title: "Procesos",
    url: "/procesos",
    icon: FileText,
    resource: "procesos" as ResourceType,
  },
  {
    title: "Regímenes Fiscales",
    url: "/regimenes-fiscales",
    icon: FileText,
    resource: "regimenes-fiscales" as ResourceType,
  },
  {
    title: "Asignación de Procesos",
    url: "/asignar-procesos",
    icon: ClipboardList,
    resource: "asignar-procesos" as ResourceType,
  },
  {
    title: "Histórico de Procesos",
    url: "/historico-procesos",
    icon: History,
    resource: "historico-procesos" as ResourceType,
  },
]

export function AppSidebar({ userRole }: { userRole: string | null }) {
  const pathname = usePathname()
  const role = userRole as RoleType | null

  // Filtra los elementos del sidebar basados en los permisos del usuario
  const filteredItems = sidebarItems.filter((item) => hasPermission(role, item.resource, "view"))

  return (
    <Sidebar className="border-r border-primary-green/20">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gold">Gestión Fiscal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={pathname === item.url ? "bg-accent text-white" : ""}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Versión de la aplicación obtenida desde package.json */}
      <div className="absolute bottom-4 left-4 text-xs text-white">Versión {packageInfo.version}</div>

      <SidebarRail />
    </Sidebar>
  )
}
