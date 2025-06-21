import type { Variable } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"
import { generateScalarValue } from "./scalar-generator"
import { generateArrayValue } from "./array-generator"
import { generateMatrixValue } from "./matrix-generator"
import { generateStringValue } from "./string-generator"

export function generateVariableValue(variable: Variable, existingValues: Record<string, any>): any {
  GenerationLogger.debug(`Generating value for ${variable.name} (${variable.type})`)

  return GenerationLogger.withIndent(() => {
    switch (variable.type) {
      case "int":
      case "float":
      case "double":
        return generateScalarValue(variable, existingValues)
      case "array":
        return generateArrayValue(variable, existingValues)
      case "string":
        return generateStringValue(variable, existingValues)
      case "matrix":
        return generateMatrixValue(variable, existingValues)
      default:
        GenerationLogger.warn(`Unknown variable type: ${variable.type}`)
        return Math.floor(Math.random() * 100) + 1
    }
  })
}

export * from "./scalar-generator"
export * from "./array-generator"
export * from "./matrix-generator"
export * from "./string-generator"
