import type { Variable, OutputFormat } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function formatOutput(
  generatedValues: Record<string, any>,
  variables: Variable[],
  outputFormat: OutputFormat,
): string {
  GenerationLogger.debug("Formatting output...")

  const testcaseLines: string[] = []

  for (const line of outputFormat.structure) {
    GenerationLogger.debug(`Processing line:`, line)

    if (!line.variableIds || line.variableIds.length === 0) {
      GenerationLogger.debug("Skipping empty line")
      continue
    }

    const lineValues: string[] = []

    for (const varId of line.variableIds) {
      const value = generatedValues[varId]
      GenerationLogger.debug(`Looking up variable ${varId}: ${JSON.stringify(value)}`)

      if (value === undefined) {
        GenerationLogger.warn(`❌ Variable ${varId} not found in generated values`)
        continue
      }

      // Handle different value types properly
      if (Array.isArray(value)) {
        // Check if it's a 2D array (matrix)
        if (Array.isArray(value[0])) {
          // It's a matrix - format each row
          const matrixRows = value.map((row: number[]) => row.join(" "))

          if (line.type === "newline_separated" || line.type === "single") {
            // Each row on separate line
            lineValues.push(...matrixRows)
          } else {
            // All rows as one value (flatten with row separator)
            lineValues.push(matrixRows.join(" "))
          }
        } else {
          // It's a 1D array
          lineValues.push(value.join(" "))
        }
      } else {
        lineValues.push(String(value))
      }
    }

    if (lineValues.length === 0) {
      GenerationLogger.debug("No values for this line, skipping")
      continue
    }

    let formattedLine = ""
    switch (line.type) {
      case "single":
        formattedLine = lineValues[0]
        break
      case "space_separated":
        formattedLine = lineValues.join(" ")
        break
      case "newline_separated":
        testcaseLines.push(...lineValues)
        continue // Don't add to formattedLine
      case "custom":
        formattedLine = lineValues.join(line.customSeparator || " ")
        break
      default:
        formattedLine = lineValues.join(" ")
    }

    if (formattedLine) {
      testcaseLines.push(formattedLine)
      GenerationLogger.debug(`Added line: "${formattedLine}"`)
    }
  }

  const result = testcaseLines.join("\n")
  GenerationLogger.debug(`Formatted output complete`)
  return result
}
