import Image from "next/image"
import Link from "next/link"

type LogoVariant = "vertical" | "horizontal"
type LogoColor = "black" | "white" | "green"

interface LogoProps {
  variant?: LogoVariant
  color?: LogoColor
  width?: number
  height?: number
  className?: string
  href?: string
}

export function Logo({
  variant = "horizontal",
  color = "green",
  width,
  height,
  className = "",
  href = "/",
}: LogoProps) {
  let logoSrc = ""
  let defaultWidth = 0
  let defaultHeight = 0

  if (variant === "vertical") {
    defaultWidth = 120
    defaultHeight = 150
    if (color === "black") {
      logoSrc = "/images/logo-vert-black.png"
    } else if (color === "white") {
      logoSrc = "/images/logo-vert-white.png" 
    } else {
      logoSrc = "/images/logo-vert-black.png"
    }
  } else {
    defaultWidth = 200
    defaultHeight = 60
    if (color === "black") {
      logoSrc = "/images/logo-hor-black.png"
    } else if (color === "white") {
      logoSrc = "/images/logo-hor-white.png"
    } else {
      logoSrc = "/images/logo-hor-black.png" 
    }
  }

  const logoComponent = (
    <Image
      src={logoSrc || "/placeholder.svg"}
      alt="Luenser Logo"
      width={width || defaultWidth}
      height={height || defaultHeight}
      className={className}
      priority
    />
  )

  if (href) {
    return <Link href={href}>{logoComponent}</Link>
  }

  return logoComponent
}
