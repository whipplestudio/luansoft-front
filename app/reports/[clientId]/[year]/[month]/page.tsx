"use client"

import { ReportContentDynamic } from "@/components/contpaq-data"
import { useParams } from "next/navigation"

export default function ReportPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const year = parseInt(params.year as string)
  const monthNumber = params.month as string
  
  // Formato: YYYY-MM (ejemplo: "2024-01")
  const month = `${year}-${monthNumber}`

  return (
    <div className="w-full">
      <ReportContentDynamic
        clientId={clientId}
        year={year}
        month={month}
        onClose={undefined}
      />
    </div>
  )
}
