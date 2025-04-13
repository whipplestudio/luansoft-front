// Define los tipos de recursos que pueden estar protegidos en la aplicación
export type ResourceType =
  | "dashboard"
  | "usuarios"
  | "contadores"
  | "clientes"
  | "contactos"
  | "asignacion-contadores"
  | "asignacion-contactos"
  | "procesos"
  | "regimenes-fiscales"
  | "asignar-procesos"
  | "historico-procesos"

// Define las acciones que se pueden realizar en los recursos
export type ActionType = "view" | "create" | "edit" | "delete"

// Define los roles disponibles en la aplicación
export type RoleType = "admin" | "contador" | "cliente" | "dashboard"

// Interfaz para permisos por rol
interface RolePermissions {
  [resource: string]: {
    [action: string]: boolean
  }
}

// Definición de permisos por rol
const PERMISSIONS: Record<RoleType, RolePermissions> = {
  admin: {
    // Los administradores tienen acceso completo a todo
    dashboard: { view: true, create: true, edit: true, delete: true },
    usuarios: { view: true, create: true, edit: true, delete: true },
    contadores: { view: true, create: true, edit: true, delete: true },
    clientes: { view: true, create: true, edit: true, delete: true },
    contactos: { view: true, create: true, edit: true, delete: true },
    "asignacion-contadores": { view: true, create: true, edit: true, delete: true },
    "asignacion-contactos": { view: true, create: true, edit: true, delete: true },
    procesos: { view: true, create: true, edit: true, delete: true },
    "regimenes-fiscales": { view: true, create: true, edit: true, delete: true },
    "asignar-procesos": { view: true, create: true, edit: true, delete: true },
    "historico-procesos": { view: true, create: true, edit: true, delete: true },
  },
  contador: {
    // Permisos específicos para el rol contador según los requisitos
    dashboard: { view: true, create: true, edit: true, delete: true },
    usuarios: { view: false, create: false, edit: false, delete: false },
    contadores: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: true, edit: true, delete: true },
    contactos: { view: false, create: false, edit: false, delete: false },
    "asignacion-contadores": { view: true, create: false, edit: false, delete: false },
    "asignacion-contactos": { view: false, create: false, edit: false, delete: false },
    procesos: { view: true, create: false, edit: false, delete: false },
    "regimenes-fiscales": { view: true, create: false, edit: false, delete: false },
    "asignar-procesos": { view: true, create: true, edit: true, delete: true },
    "historico-procesos": { view: true, create: true, edit: true, delete: true },
  },
  cliente: {
    // Permisos básicos para clientes
    dashboard: { view: false, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    contadores: { view: false, create: false, edit: false, delete: false },
    clientes: { view: false, create: false, edit: false, delete: false },
    contactos: { view: false, create: false, edit: false, delete: false },
    "asignacion-contadores": { view: false, create: false, edit: false, delete: false },
    "asignacion-contactos": { view: false, create: false, edit: false, delete: false },
    procesos: { view: false, create: false, edit: false, delete: false },
    "regimenes-fiscales": { view: false, create: false, edit: false, delete: false },
    "asignar-procesos": { view: false, create: false, edit: false, delete: false },
    "historico-procesos": { view: true, create: false, edit: false, delete: false },
  },
  dashboard: {
    // Permisos para el rol dashboard
    dashboard: { view: true, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    contadores: { view: false, create: false, edit: false, delete: false },
    clientes: { view: false, create: false, edit: false, delete: false },
    contactos: { view: false, create: false, edit: false, delete: false },
    "asignacion-contadores": { view: false, create: false, edit: false, delete: false },
    "asignacion-contactos": { view: false, create: false, edit: false, delete: false },
    procesos: { view: false, create: false, edit: false, delete: false },
    "regimenes-fiscales": { view: false, create: false, edit: false, delete: false },
    "asignar-procesos": { view: false, create: false, edit: false, delete: false },
    "historico-procesos": { view: false, create: false, edit: false, delete: false },
  },
}

/**
 * Verifica si un usuario con un rol específico tiene permiso para realizar una acción sobre un recurso
 */
export function hasPermission(role: RoleType | null | string, resource: ResourceType, action: ActionType): boolean {
  if (!role) return false
  return PERMISSIONS[role as RoleType]?.[resource]?.[action] || false
}

/**
 * Hook personalizado para verificar permisos basados en el rol actual del usuario
 */
export function usePermissions(userRole: RoleType | null | string) {
  return {
    can: (resource: ResourceType, action: ActionType) => hasPermission(userRole as RoleType, resource, action),
    role: userRole,
  }
}

/**
 * Obtiene el ID del contador logueado desde localStorage
 */
export function getLoggedContadorId(): string | null {
  try {
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      return userData.id
    }
    return null
  } catch (error) {
    console.error("Error al obtener el ID del contador:", error)
    return null
  }
}
