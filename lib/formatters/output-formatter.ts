import type { Variable, OutputFormat } from "@/types/variables"

/*
  Converts the generatedValues map into a testcase string
  according to the user-defined OutputFormat.
*/
export function formatOutput(generated: Record<string, any>, variables: Variable[], format: OutputFormat): string {
  const lines: string[] = []

  for (const line of format.structure) {
    if (!line.variableIds || line.variableIds.length === 0) continue

    const parts: string[] = []

    for (const id of line.variableIds) {
      const value = generated[id]

      if (value === undefined) continue

      // Matrix? (2-D array)
      if (Array.isArray(value) && Array.isArray(value[0])) {
        const rows = (value as number[][]).map((row) => row.join(" "))
        if (line.type === "newline_separated" || line.type === "single") {
          parts.push(...rows)
        } else {
          parts.push(rows.join(" "))
        }
      }
      // 1-D array
      else if (Array.isArray(value)) {
        parts.push((value as number[]).join(" "))
      }
      // Scalar / string
      else {
        parts.push(String(value))
      }
    }

    if (parts.length === 0) continue

    switch (line.type) {
      case "single":
        lines.push(parts[0])
        break
      case "space_separated":
        lines.push(parts.join(" "))
        break
      case "newline_separated":
        lines.push(...parts)
        break
      case "custom":
        lines.push(parts.join(line.customSeparator || " "))
        break
      default:
        lines.push(parts.join(" "))
    }
  }

  return lines.join("\n")
}
