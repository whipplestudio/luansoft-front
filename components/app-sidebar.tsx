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

// Actualizar el ítem "Asignación de Clientes" a "Asignación de Contadores"
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["admin", "contador"],
  },
  {
    title: "Usuarios",
    url: "/usuarios",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Contadores",
    url: "/contadores",
    icon: Calculator,
    roles: ["admin"],
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: UserCircle,
    roles: ["admin", "contador"],
  },
  {
    title: "Contactos",
    url: "/contactos",
    icon: Contact,
    roles: ["admin", "contador"],
  },
  {
    title: "Asignación de Contadores",
    url: "/asignacion-contadores",
    icon: UserPlus,
    roles: ["admin"],
  },
  {
    title: "Asignación de Contactos",
    url: "/asignacion-contactos",
    icon: UserPlus,
    roles: ["admin"],
  },
  {
    title: "Procesos",
    url: "/procesos",
    icon: FileText,
    roles: ["admin"],
  },
  {
    title: "Regímenes Fiscales",
    url: "/regimenes-fiscales",
    icon: FileText,
    roles: ["admin"],
  },
  {
    title: "Asignación de Procesos",
    url: "/asignar-procesos",
    icon: ClipboardList,
    roles: ["admin", "contador"],
  },
  {
    title: "Histórico de Procesos",
    url: "/historico-procesos",
    icon: History,
    roles: ["admin", "contador"],
  },
]

export function AppSidebar({ userRole }: { userRole: string | null }) {
  const pathname = usePathname()
  const filteredItems = items.filter((item) => item.roles.includes(userRole || ""))

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
      <SidebarRail />
    </Sidebar>
  )
}
