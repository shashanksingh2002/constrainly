import type { Variable, ArrayConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"
import { generateScalarValue } from "./scalar-generator"

export function generateArrayValue(variable: Variable, existingValues: Record<string, any>): number[] {
  const constraint = variable.constraints as ArrayConstraint

  // Determine array size
  let size: number
  if (constraint.sizeType === "linked" && constraint.linkedSizeVariable) {
    size = existingValues[constraint.linkedSizeVariable] || 5
    GenerationLogger.debug(`🔗 Array size linked to variable: ${size}`)
  } else {
    const minSize = constraint.minSize || 1
    const maxSize = constraint.maxSize || 10
    size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize
    GenerationLogger.debug(`📏 Array size: ${size} (range: ${minSize}-${maxSize})`)
  }

  const result: number[] = []

  // Generate array elements
  for (let i = 0; i < size; i++) {
    const elementVariable: Variable = {
      id: `${variable.id}_${i}`,
      name: `${variable.name}[${i}]`,
      type: constraint.elementType || "int",
      constraints: {
        type: "scalar",
        min: constraint.elementMin || 1,
        max: constraint.elementMax || 100,
      },
    }

    const value = generateScalarValue(elementVariable, existingValues)
    result.push(value)
  }

  GenerationLogger.debug(`✅ Generated array: [${result.join(", ")}]`)
  return result
}
