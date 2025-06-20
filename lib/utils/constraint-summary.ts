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

    case "matrix":
      const matrixParts = []
      if (constraint.matrixType) matrixParts.push(constraint.matrixType)
      if (constraint.rowsType === "manual" && constraint.minRows) {
        matrixParts.push(`${constraint.minRows}×${constraint.minCols || "?"}`)
      }
      return matrixParts.join(" ")

    case "string":
      return `${constraint.charSet}`

    case "tree":
      const treeParts = []
      treeParts.push(constraint.treeType)
      if (constraint.maxDepth) treeParts.push(`depth≤${constraint.maxDepth}`)
      return treeParts.join(" ")

    case "graph":
      const graphParts = []
      graphParts.push(constraint.graphType)
      if (constraint.connected) graphParts.push("connected")
      if (constraint.weighted) graphParts.push("weighted")
      return graphParts.join(" ")

    default:
      return ""
  }
}
