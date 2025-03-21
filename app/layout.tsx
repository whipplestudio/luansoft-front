import type React from "react"
import ClientLayout from "./clientLayout"
import "./globals.css" // Make sure this import is present

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}

