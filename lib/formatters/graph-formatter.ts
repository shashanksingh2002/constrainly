import type { Variable } from "@/types/variables"

export function formatGraphOutput(graphData: any, variable: Variable, lineType: string): string {
  if (!graphData) return ""

  // Handle edge list format (2D array)
  if (Array.isArray(graphData) && Array.isArray(graphData[0])) {
    const formatted = graphData.map((edge: number[]) => edge.join(" "))

    switch (lineType) {
      case "newline_separated":
        return formatted.join("\n")
      case "space_separated":
        return formatted.join(" ")
      case "custom":
        return formatted.join(" ") // Default to space if custom separator not specified
      default:
        return formatted.join("\n")
    }
  }

  // Handle adjacency list format (object or array)
  if (typeof graphData === "object" && !Array.isArray(graphData)) {
    const formatted = Object.entries(graphData).map(
      ([node, neighbors]) => `${node}: ${Array.isArray(neighbors) ? neighbors.join(" ") : neighbors}`,
    )

    switch (lineType) {
      case "newline_separated":
        return formatted.join("\n")
      case "space_separated":
        return formatted.join(" ")
      default:
        return formatted.join("\n")
    }
  }

  // Handle simple array
  if (Array.isArray(graphData)) {
    switch (lineType) {
      case "newline_separated":
        return graphData.join("\n")
      case "space_separated":
        return graphData.join(" ")
      default:
        return graphData.join(" ")
    }
  }

  // Fallback: convert to string
  return String(graphData)
}
