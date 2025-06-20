import type { Variable } from "@/types/variables"
import { VARIABLE_TYPE_ICONS, VARIABLE_TYPE_COLORS } from "@/lib/constants/variable-types"

interface GraphLegendProps {
  variables: Variable[]
}

export function GraphLegend({ variables }: GraphLegendProps) {
  return (
    <div className="p-4 border-t bg-gray-50/50">
      <div className="flex flex-wrap gap-2">
        {Object.entries(VARIABLE_TYPE_COLORS).map(([type, colors]) => {
          const hasVariables = variables.some((v) => v.type === type)
          if (!hasVariables) return null

          const Icon = VARIABLE_TYPE_ICONS[type as keyof typeof VARIABLE_TYPE_ICONS]
          return (
            <div key={type} className="flex items-center gap-1 text-xs">
              <div
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: colors.bg, borderColor: colors.border }}
              />
              <Icon className="w-3 h-3" style={{ color: colors.text }} />
              <span className="capitalize">{type}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
