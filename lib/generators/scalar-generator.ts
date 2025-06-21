import type { Variable, ScalarConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function generateScalarValue(variable: Variable, existingValues: Record<string, any>): number {
  const constraint = variable.constraint as ScalarConstraint
  let min = constraint.min ?? 1
  let max = constraint.max ?? 100

  GenerationLogger.debug(`Initial range for ${variable.name}: [${min}, ${max}]`)

  // Handle value dependencies
  if (constraint.dependsOnValue && constraint.dependsOnValue.variableId) {
    GenerationLogger.debug(`🔗 ${variable.name} depends on variable ID: ${constraint.dependsOnValue.variableId}`)
    GenerationLogger.debug(`🔗 Relationship: ${constraint.dependsOnValue.relationship}`)

    const dependentValue = existingValues[constraint.dependsOnValue.variableId]

    if (dependentValue === undefined) {
      GenerationLogger.error(`Dependent variable ${constraint.dependsOnValue.variableId} not found!`)
      GenerationLogger.debug("Available values:", Object.keys(existingValues))
      return min // Fallback to min value
    }

    const { relationship, multiplier = 1, offset = 0 } = constraint.dependsOnValue

    switch (relationship) {
      case "less_than":
        const newMaxLT = Math.floor(dependentValue * multiplier + offset) - 1
        max = Math.min(max, newMaxLT)
        GenerationLogger.debug(
          `🔗 less_than: ${dependentValue} * ${multiplier} + ${offset} - 1 = ${newMaxLT}, new max: ${max}`,
        )
        break
      case "less_equal":
        const newMaxLE = Math.floor(dependentValue * multiplier + offset)
        max = Math.min(max, newMaxLE)
        GenerationLogger.debug(
          `🔗 less_equal: ${dependentValue} * ${multiplier} + ${offset} = ${newMaxLE}, new max: ${max}`,
        )
        break
      case "greater_than":
        const newMinGT = Math.ceil(dependentValue * multiplier + offset) + 1
        min = Math.max(min, newMinGT)
        GenerationLogger.debug(
          `🔗 greater_than: ${dependentValue} * ${multiplier} + ${offset} + 1 = ${newMinGT}, new min: ${min}`,
        )
        break
      case "greater_equal":
        const newMinGE = Math.ceil(dependentValue * multiplier + offset)
        min = Math.max(min, newMinGE)
        GenerationLogger.debug(
          `🔗 greater_equal: ${dependentValue} * ${multiplier} + ${offset} = ${newMinGE}, new min: ${min}`,
        )
        break
      case "equal_to":
        const exactValue = Math.floor(dependentValue * multiplier + offset)
        GenerationLogger.debug(`🔗 equal_to: ${dependentValue} * ${multiplier} + ${offset} = ${exactValue}`)
        return exactValue
    }

    GenerationLogger.debug(`Adjusted range for ${variable.name}: [${min}, ${max}]`)
  }

  // Ensure min <= max
  if (min > max) {
    GenerationLogger.warn(`Invalid range for ${variable.name}: min(${min}) > max(${max}). Using min value.`)
    return min
  }

  const value = Math.floor(Math.random() * (max - min + 1)) + min
  GenerationLogger.success(`Generated scalar value: ${value}`)
  return value
}
