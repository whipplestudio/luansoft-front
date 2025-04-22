import type React from "react"
import ClientLayout from "./clientLayout"
import "./globals.css" // Make sure this import is present
// Importar los estilos del visor de PDF
import "./pdf-viewer.css"

export const metadata = {
  title: "Luenser CMS Fiscal",
  description: "Sistema de gestión fiscal para contadores y clientes",
  icons: {
    icon: [
      {
        url: "/images/logo-vert-green.png",
        href: "/images/logo-vert-green.png",
      },
    ],
    shortcut: "/images/logo-vert-green.png",
    apple: "/images/logo-vert-green.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
