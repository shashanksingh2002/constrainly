import type { Variable, ScalarConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function generateScalarValue(variable: Variable, existingValues: Record<string, any>): number {
  const constraint = variable.constraints as ScalarConstraint

  GenerationLogger.debug(`Initial range for ${variable.name}: [${constraint.min}, ${constraint.max}]`)

  let min = constraint.min || 1
  let max = constraint.max || 1000

  // Handle dependencies
  if (constraint.dependsOnValue) {
    const dependentValue = existingValues[constraint.dependsOnValue.variableId]
    if (dependentValue !== undefined) {
      const multiplier = constraint.dependsOnValue.multiplier || 1
      const offset = constraint.dependsOnValue.offset || 0
      const newValue = dependentValue * multiplier + offset

      GenerationLogger.debug(
        `🔗 ${constraint.dependsOnValue.relationship}: ${dependentValue} * ${multiplier} + ${offset} = ${newValue}`,
      )

      switch (constraint.dependsOnValue.relationship) {
        case "less_than":
          max = Math.min(max, newValue - 1)
          GenerationLogger.debug(`🔗 new max: ${max}`)
          break
        case "less_equal":
          max = Math.min(max, newValue)
          GenerationLogger.debug(`🔗 new max: ${max}`)
          break
        case "greater_than":
          min = Math.max(min, newValue + 1)
          GenerationLogger.debug(`🔗 new min: ${min}`)
          break
        case "greater_equal":
          min = Math.max(min, newValue)
          GenerationLogger.debug(`🔗 new min: ${min}`)
          break
        case "equal":
          min = max = newValue
          GenerationLogger.debug(`🔗 fixed value: ${newValue}`)
          break
      }
    }
  }

  // Ensure valid range
  if (min > max) {
    GenerationLogger.warn(`Invalid range [${min}, ${max}], using min value`)
    max = min
  }

  const value =
    variable.type === "int" ? Math.floor(Math.random() * (max - min + 1)) + min : Math.random() * (max - min) + min

  GenerationLogger.debug(`✅ Generated scalar value: ${value}`)
  return value
}
