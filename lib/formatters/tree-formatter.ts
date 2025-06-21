import type { Variable } from "@/types/variables"

export function formatTreeOutput(treeData: any, variable: Variable, lineType: string): string {
  if (!treeData) return ""

  // If treeData is already formatted (array of numbers), use it directly
  if (Array.isArray(treeData) && typeof treeData[0] === "number") {
    switch (lineType) {
      case "newline_separated":
        return treeData.join("\n")
      case "space_separated":
        return treeData.join(" ")
      case "custom":
        return treeData.join(" ") // Default to space if custom separator not specified
      default:
        return treeData.join(" ")
    }
  }

  // If it's a 2D array (adjacency list), format accordingly
  if (Array.isArray(treeData) && Array.isArray(treeData[0])) {
    const formatted = treeData.map((row: number[]) => row.join(" "))

    switch (lineType) {
      case "newline_separated":
        return formatted.join("\n")
      case "space_separated":
        return formatted.join(" ")
      default:
        return formatted.join("\n")
    }
  }

  // Fallback: convert to string
  return String(treeData)
}
