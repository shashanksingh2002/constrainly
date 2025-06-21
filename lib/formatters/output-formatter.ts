import type { Variable, OutputFormat } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function formatOutput(
  generatedValues: Record<string, any>,
  variables: Variable[],
  outputFormat: OutputFormat,
): string {
  GenerationLogger.debug("Formatting output according to format:", outputFormat.name)

  const testcaseLines: string[] = []

  return GenerationLogger.withIndent(() => {
    for (const line of outputFormat.structure) {
      GenerationLogger.debug(`Processing line:`, line)

      if (!line.variableIds || line.variableIds.length === 0) {
        GenerationLogger.debug("Skipping empty line")
        continue
      }

      const lineValues: string[] = []

      for (const varId of line.variableIds) {
        const value = generatedValues[varId]
        const variable = variables.find((v) => v.id === varId)

        GenerationLogger.debug(`Looking up variable ${variable?.name || varId}: ${JSON.stringify(value)}`)

        if (value === undefined) {
          GenerationLogger.warn(`Variable ${varId} not found in generated values`)
          continue
        }

        const formattedValue = formatValue(value, variable?.type || "unknown")

        if (line.type === "newline_separated" && Array.isArray(formattedValue)) {
          lineValues.push(...formattedValue)
        } else {
          lineValues.push(Array.isArray(formattedValue) ? formattedValue.join(" ") : formattedValue)
        }
      }

      if (lineValues.length === 0) {
        GenerationLogger.debug("No values for this line, skipping")
        continue
      }

      const formattedLine = formatLine(lineValues, line.type, line.customSeparator)

      if (line.type === "newline_separated") {
        testcaseLines.push(...lineValues)
      } else if (formattedLine) {
        testcaseLines.push(formattedLine)
        GenerationLogger.debug(`Added line: "${formattedLine}"`)
      }
    }

    const result = testcaseLines.join("\n")
    GenerationLogger.success("Output formatting complete")
    return result
  })
}

function formatValue(value: any, type: string): string | string[] {
  GenerationLogger.debug(`Formatting ${type} value:`, value)

  switch (type) {
    case "matrix":
      // Matrix is 2D array - format each row
      if (Array.isArray(value) && Array.isArray(value[0])) {
        return value.map((row: number[]) => row.join(" "))
      }
      break
    case "array":
      // Array is 1D - join with spaces
      if (Array.isArray(value)) {
        return value.join(" ")
      }
      break
    default:
      // Scalar values
      return String(value)
  }

  return String(value)
}

function formatLine(values: string[], type: string, customSeparator?: string): string {
  switch (type) {
    case "single":
      return values[0] || ""
    case "space_separated":
      return values.join(" ")
    case "custom":
      return values.join(customSeparator || " ")
    default:
      return values.join(" ")
  }
}
