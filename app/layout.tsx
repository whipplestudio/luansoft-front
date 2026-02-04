import type React from "react"
import { Jost } from "next/font/google"
import ClientLayout from "./clientLayout"
import "./globals.css" // Make sure this import is present
// Importar los estilos del visor de PDF
import "./pdf-viewer.css"
import { Toaster } from "sonner"

// Load Jost font with all the weights we need
const jost = Jost({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-jost",
})

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
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${jost.className} ${jost.variable}`}>
        <ClientLayout>
          <Toaster position="top-center" />
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
