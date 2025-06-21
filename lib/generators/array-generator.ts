import type { Variable, ArrayConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function generateArrayValue(variable: Variable, existingValues: Record<string, any>): number[] {
  const constraint = variable.constraint as ArrayConstraint

  let size = constraint.minSize || 5

  // Handle linked size
  if (constraint.sizeType === "linked" && constraint.linkedVariable) {
    const linkedValue = existingValues[constraint.linkedVariable]
    if (linkedValue !== undefined) {
      size = linkedValue
      GenerationLogger.debug(`🔗 Array size linked to ${constraint.linkedVariable}: ${size}`)
    }
  } else if (constraint.sizeType === "manual") {
    const minSize = constraint.minSize || 1
    const maxSize = constraint.maxSize || 10
    size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize
    GenerationLogger.debug(`📏 Random array size in range [${minSize}, ${maxSize}]: ${size}`)
  }

  const elementMin = constraint.elementMin ?? 1
  const elementMax = constraint.elementMax ?? 100

  GenerationLogger.debug(`Generating array of size ${size}, elements in [${elementMin}, ${elementMax}]`)

  const arr: number[] = []
  for (let i = 0; i < size; i++) {
    let elementValue = Math.floor(Math.random() * (elementMax - elementMin + 1)) + elementMin

    // Handle element dependencies
    if (constraint.elementDependsOnValue?.variableId) {
      const dependentValue = existingValues[constraint.elementDependsOnValue.variableId]
      if (dependentValue !== undefined) {
        const { relationship } = constraint.elementDependsOnValue
        switch (relationship) {
          case "less_than":
            elementValue = Math.min(elementValue, dependentValue - 1)
            break
          case "less_equal":
            elementValue = Math.min(elementValue, dependentValue)
            break
          case "bounded_by":
            elementValue = Math.min(elementValue, dependentValue)
            break
        }
        GenerationLogger.debug(`🔗 Element ${i} adjusted by dependency: ${elementValue}`)
      }
    }

    arr.push(elementValue)
  }

  GenerationLogger.success(`Generated array: [${arr.join(", ")}]`)
  return arr
}
