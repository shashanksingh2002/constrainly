import type { Variable, ScalarConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

/*
  Generates a scalar (int/float/double) value honoring min/max bounds
  and optional runtime dependency on another variable’s value.
*/
export function generateScalarValue(variable: Variable, existingValues: Record<string, any>): number {
  const constraint = variable.constraint as ScalarConstraint
  let min = constraint.min ?? 1
  let max = constraint.max ?? 100

  GenerationLogger.debug(`Initial range for ${variable.name}: [${min}, ${max}]`)

  if (constraint.dependsOnValue?.variableId) {
    const depId = constraint.dependsOnValue.variableId
    const depVal = existingValues[depId]

    if (depVal === undefined) {
      GenerationLogger.error(`Dependent variable ${depId} not found for ${variable.name}`)
    } else {
      const { relationship, multiplier = 1, offset = 0 } = constraint.dependsOnValue
      const calc = Math.floor(depVal * multiplier + offset)
      switch (relationship) {
        case "less_than":
          max = Math.min(max, calc - 1)
          break
        case "less_equal":
          max = Math.min(max, calc)
          break
        case "greater_than":
          min = Math.max(min, calc + 1)
          break
        case "greater_equal":
          min = Math.max(min, calc)
          break
        case "equal_to":
          GenerationLogger.success(`Generated scalar value (equal_to): ${calc}`)
          return calc
      }
    }
    GenerationLogger.debug(`Adjusted range: [${min}, ${max}]`)
  }

  if (min > max) {
    GenerationLogger.warn(`Invalid range for ${variable.name}. Using min value ${min}`)
    return min
  }

  const val = Math.floor(Math.random() * (max - min + 1)) + min
  GenerationLogger.success(`Generated scalar value: ${val}`)
  return val
}
