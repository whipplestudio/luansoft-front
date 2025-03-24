import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProgressBarProps {
  percentage: number
}

const getStatusColor = (percentage: number) => {
  if (percentage <= 33) return "bg-red-600"
  if (percentage <= 66) return "bg-yellow-400"
  return "bg-green-600"
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  const barColor = getStatusColor(percentage)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${barColor}`}
                  style={{ width: `${percentage}%`, maxWidth: "100%" }}
                />
              </div>
              <span className="text-sm font-medium whitespace-nowrap">{percentage}%</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Estado: {percentage <= 33 ? "Atrasado" : percentage <= 66 ? "En progreso" : "Completado"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

