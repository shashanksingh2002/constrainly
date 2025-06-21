"use server"

import type { Variable, OutputFormat, ScalarConstraint } from "@/types/variables"

export const generateTestcases = async (
  variables: Variable[],
  count: number,
  outputFormat: OutputFormat,
): Promise<string> => {
  const testcases: string[] = []

  for (let i = 0; i < count; i++) {
    const generatedValues: Record<string, any> = {}

    // Sort variables by dependencies (variables without dependencies first)
    const sortedVariables = topologicalSort(variables)

    // Generate values respecting dependencies
    for (const variable of sortedVariables) {
      generatedValues[variable.id] = generateVariableValue(variable, generatedValues)
    }

    // Format according to output format
    const testcaseLines: string[] = []

    for (const line of outputFormat.structure) {
      const lineValues: string[] = []

      for (const varId of line.variableIds) {
        // Fixed: was line.variables
        const value = generatedValues[varId]
        if (Array.isArray(value)) {
          lineValues.push(value.join(" "))
        } else {
          lineValues.push(String(value))
        }
      }

      switch (line.type) {
        case "single":
          testcaseLines.push(lineValues[0] || "")
          break
        case "space_separated":
          testcaseLines.push(lineValues.join(" "))
          break
        case "newline_separated":
          testcaseLines.push(...lineValues)
          break
        case "custom":
          testcaseLines.push(lineValues.join(line.customSeparator || " "))
          break
      }
    }

    testcases.push(testcaseLines.join("\n"))
  }

  return testcases.join("\n\n")
}

function topologicalSort(variables: Variable[]): Variable[] {
  const sorted: Variable[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()

  function visit(variable: Variable) {
    if (visiting.has(variable.id)) {
      throw new Error(`Circular dependency detected involving ${variable.name}`)
    }
    if (visited.has(variable.id)) return

    visiting.add(variable.id)

    // Visit dependencies first
    for (const depId of variable.dependencies) {
      const depVariable = variables.find((v) => v.id === depId)
      if (depVariable) {
        visit(depVariable)
      }
    }

    visiting.delete(variable.id)
    visited.add(variable.id)
    sorted.push(variable)
  }

  for (const variable of variables) {
    if (!visited.has(variable.id)) {
      visit(variable)
    }
  }

  return sorted
}

function generateVariableValue(variable: Variable, existingValues: Record<string, any>): any {
  switch (variable.type) {
    case "int":
    case "float":
    case "double":
      return generateScalarValue(variable, existingValues)
    case "array":
      return generateArrayValue(variable, existingValues)
    default:
      return Math.floor(Math.random() * 100) + 1
  }
}

function generateScalarValue(variable: Variable, existingValues: Record<string, any>): number {
  const constraint = variable.constraint as ScalarConstraint
  let min = constraint.min || 1
  let max = constraint.max || 100

  // Handle value dependencies
  if (constraint.dependsOnValue && constraint.dependsOnValue.variableId) {
    const dependentValue = existingValues[constraint.dependsOnValue.variableId]
    if (dependentValue !== undefined) {
      const { relationship, multiplier = 1, offset = 0 } = constraint.dependsOnValue

      switch (relationship) {
        case "less_than":
          max = Math.min(max, Math.floor(dependentValue * multiplier + offset) - 1)
          break
        case "less_equal":
          max = Math.min(max, Math.floor(dependentValue * multiplier + offset))
          break
        case "greater_than":
          min = Math.max(min, Math.ceil(dependentValue * multiplier + offset) + 1)
          break
        case "greater_equal":
          min = Math.max(min, Math.ceil(dependentValue * multiplier + offset))
          break
        case "equal_to":
          const exactValue = Math.floor(dependentValue * multiplier + offset)
          return exactValue
        case "multiple_of":
          const baseValue = dependentValue * multiplier + offset
          const multiples = []
          for (let i = 1; i <= 10; i++) {
            const multiple = baseValue * i
            if (multiple >= min && multiple <= max) {
              multiples.push(multiple)
            }
          }
          return multiples.length > 0 ? multiples[Math.floor(Math.random() * multiples.length)] : min
        case "custom":
          // For custom formulas, we'd need a proper expression evaluator
          // For now, just return a safe value
          return Math.floor(Math.random() * (max - min + 1)) + min
      }
    }
  }

  // Ensure min <= max
  if (min > max) {
    console.warn(`Invalid range for ${variable.name}: min(${min}) > max(${max}). Using min value.`)
    return min
  }

  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateArrayValue(variable: Variable, existingValues: Record<string, any>): number[] {
  const constraint = variable.constraint as any
  const size = constraint.minSize || 5
  const elementMin = constraint.elementMin || 1
  const elementMax = constraint.elementMax || 100

  const arr: number[] = []
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * (elementMax - elementMin + 1)) + elementMin)
  }

  return arr
}
