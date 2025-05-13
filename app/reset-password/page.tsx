import { Suspense } from "react"
import ResetPasswordClient from "./clientPage"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Cargando formulario...</div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
