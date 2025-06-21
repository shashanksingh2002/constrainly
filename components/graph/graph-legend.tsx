import { Badge } from "@/components/ui/badge"
import type { Variable } from "@/types/variables"

interface GraphLegendProps {
  variables: Variable[]
}

export function GraphLegend({ variables }: GraphLegendProps) {
  const typeColors = {
    int: "bg-blue-500",
    float: "bg-green-500",
    double: "bg-emerald-500",
    string: "bg-purple-500",
    array: "bg-orange-500",
    matrix: "bg-red-500",
    tree: "bg-yellow-500",
    graph: "bg-pink-500",
  }

  const typeCounts = variables.reduce(
    (acc, variable) => {
      acc[variable.type] = (acc[variable.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const dependentCount = variables.filter((v) => {
    const constraint = v.constraint
    let hasDeps = false

    switch (constraint.type) {
      case "array":
        hasDeps = constraint.sizeType === "linked"
        break
      case "matrix":
        hasDeps = constraint.rowsType === "linked" || constraint.colsType === "linked"
        break
      case "string":
        hasDeps = constraint.lengthType === "linked"
        break
      case "tree":
        hasDeps = constraint.nodeCountType === "linked"
        break
      case "graph":
        hasDeps = constraint.nodesType === "linked" || constraint.edgesType === "linked"
        break
    }

    return hasDeps || (v.dependencies && v.dependencies.length > 0)
  }).length

  return (
    <div className="p-4 border-t bg-muted/30">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Variable Types:</span>
          {Object.entries(typeCounts).map(([type, count]) => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${typeColors[type as keyof typeof typeColors]}`} />
              {type} ({count})
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <strong>{variables.length - dependentCount}</strong> independent
          </span>
          <span>
            <strong>{dependentCount}</strong> dependent
          </span>
        </div>
      </div>
    </div>
  )
}
