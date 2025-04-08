import type React from "react"
import ClientLayout from "./clientLayout"
import "./globals.css" // Make sure this import is present
// Importar los estilos del visor de PDF
import "./pdf-viewer.css"

export const metadata = {
  title: "Luenser CMS Fiscal",
  description: "Sistema de gestión fiscal para contadores y clientes",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}

