import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function useLoading() {
  const [isLoading, setIsLoading] = useState(false)
  //const pathname = usePathname()
  //const searchParams = useSearchParams()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    handleStart()
    const timer = setTimeout(() => handleComplete(), 500) // Simular una carga mínima

    return () => clearTimeout(timer)
  }, [])

  return isLoading
}

