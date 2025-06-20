import type { Variable } from "@/types/variables"

export function getConstraintSummary(variable: Variable, variables: Variable[]): string {
  const constraint = variable.constraint

  switch (constraint.type) {
    case "scalar":
      const parts = []
      if (constraint.min !== undefined) parts.push(`${constraint.min}`)
      if (constraint.max !== undefined) parts.push(`${constraint.max}`)
      return parts.length > 0 ? `[${parts.join("-")}]` : ""

    case "array":
      if (constraint.sizeType === "linked") {
        const linkedVar = variables.find((v) => v.id === constraint.linkedVariable)
        return linkedVar ? `size: ${linkedVar.name}` : ""
      }
      return constraint.minSize ? `[${constraint.minSize}-${constraint.maxSize || "∞"}]` : ""

    case "string":
      return `${constraint.charSet}`

    case "tree":
      return constraint.treeType

    case "graph":
      return constraint.graphType

    default:
      return ""
  }
}
