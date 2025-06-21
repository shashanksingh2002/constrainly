import type { Variable, ScalarConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function generateScalarValue(variable: Variable, existingValues: Record<string, any>): number {
  const constraint = variable.constraint as ScalarConstraint

  let min = constraint.min ?? 1
  let max = constraint.max ?? 100

  GenerationLogger.debug(`Initial range for ${variable.name}: [${min}, ${max}]`)

  // Handle dependencies
  if (constraint.dependsOnValue?.variableId) {
    const depId = constraint.dependsOnValue.variableId
    const dependentValue = existingValues[depId]

    GenerationLogger.debug(`🔗 ${variable.name} depends on variable ID: ${depId}`)
    GenerationLogger.debug(`🔗 Dependent value: ${dependentValue}`)

    if (dependentValue !== undefined) {
      const { relationship, multiplier = 1, offset = 0 } = constraint.dependsOnValue
      const calculatedValue = Math.floor(dependentValue * multiplier + offset)

      switch (relationship) {
        case "less_than":
          max = Math.min(max, calculatedValue - 1)
          GenerationLogger.debug(
            `🔗 less_than: ${dependentValue} * ${multiplier} + ${offset} - 1 = ${calculatedValue - 1}, new max: ${max}`,
          )
          break
        case "less_equal":
          max = Math.min(max, calculatedValue)
          GenerationLogger.debug(
            `🔗 less_equal: ${dependentValue} * ${multiplier} + ${offset} = ${calculatedValue}, new max: ${max}`,
          )
          break
        case "greater_than":
          min = Math.max(min, calculatedValue + 1)
          GenerationLogger.debug(
            `🔗 greater_than: ${dependentValue} * ${multiplier} + ${offset} + 1 = ${calculatedValue + 1}, new min: ${min}`,
          )
          break
        case "greater_equal":
          min = Math.max(min, calculatedValue)
          GenerationLogger.debug(
            `🔗 greater_equal: ${dependentValue} * ${multiplier} + ${offset} = ${calculatedValue}, new min: ${min}`,
          )
          break
        case "equal_to":
          GenerationLogger.debug(`🔗 equal_to: ${calculatedValue}`)
          return calculatedValue
      }
    }
  }

  // Ensure valid range
  if (min > max) {
    GenerationLogger.warn(`Invalid range [${min}, ${max}] for ${variable.name}, using min value`)
    return min
  }

  const value = Math.floor(Math.random() * (max - min + 1)) + min
  GenerationLogger.success(`Generated scalar value: ${value}`)
  return value
}
