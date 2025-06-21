import type { Variable, ArrayConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function generateArrayValue(variable: Variable, existingValues: Record<string, any>): number[] {
  const constraint = variable.constraint as ArrayConstraint

  // Determine array size
  let size: number
  if (constraint.sizeType === "linked" && constraint.linkedVariable) {
    size = existingValues[constraint.linkedVariable] || 5
    GenerationLogger.debug(`🔗 Array size linked to variable: ${size}`)
  } else {
    const minSize = constraint.minSize || 1
    const maxSize = constraint.maxSize || 10
    size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize
    GenerationLogger.debug(`📏 Array size: ${size} (range: ${minSize}-${maxSize})`)
  }

  const elementMin = constraint.elementMin ?? 1
  const elementMax = constraint.elementMax ?? 100

  GenerationLogger.debug(`🔢 Element range: [${elementMin}, ${elementMax}]`)

  const result: number[] = []

  // Generate array elements
  for (let i = 0; i < size; i++) {
    let elementValue = Math.floor(Math.random() * (elementMax - elementMin + 1)) + elementMin

    // Handle element dependencies
    if (constraint.elementDependsOnValue?.variableId) {
      const dependentValue = existingValues[constraint.elementDependsOnValue.variableId]
      if (dependentValue !== undefined) {
        const { relationship, multiplier = 1, offset = 0 } = constraint.elementDependsOnValue

        GenerationLogger.debug(`🔗 Element ${i} depends on variable: ${dependentValue}`)

        switch (relationship) {
          case "less_than":
            const maxLessThan = Math.floor(dependentValue * multiplier + offset) - 1
            elementValue = Math.min(elementValue, maxLessThan)
            break
          case "less_equal":
            const maxLessEqual = Math.floor(dependentValue * multiplier + offset)
            elementValue = Math.min(elementValue, maxLessEqual)
            break
          case "greater_than":
            const minGreaterThan = Math.ceil(dependentValue * multiplier + offset) + 1
            elementValue = Math.max(elementValue, minGreaterThan)
            break
          case "greater_equal":
            const minGreaterEqual = Math.ceil(dependentValue * multiplier + offset)
            elementValue = Math.max(elementValue, minGreaterEqual)
            break
          case "equal_to":
            elementValue = Math.floor(dependentValue * multiplier + offset)
            break
        }

        GenerationLogger.debug(
          `🔗 ${relationship}: ${dependentValue} * ${multiplier} + ${offset}, adjusted value: ${elementValue}`,
        )
      }
    }

    result.push(elementValue)
  }

  GenerationLogger.success(`Generated array: [${result.join(", ")}]`)
  return result
}
