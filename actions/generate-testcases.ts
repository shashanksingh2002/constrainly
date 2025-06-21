"use server"

import type { Variable, OutputFormat, ScalarConstraint, ArrayConstraint } from "@/types/variables"

export const generateTestcases = async (
  variables: Variable[],
  count: number,
  outputFormat: OutputFormat,
): Promise<string> => {
  console.log("=== GENERATION DEBUG ===")
  console.log(
    "Variables:",
    variables.map((v) => ({ id: v.id, name: v.name, type: v.type })),
  )
  console.log("Output Format:", outputFormat)
  console.log("Count:", count)

  if (variables.length === 0) {
    return "❌ No variables defined. Please add some variables first."
  }

  if (!outputFormat.structure || outputFormat.structure.length === 0) {
    return "❌ No output format defined. Please set up the output format."
  }

  // Check if output format has valid variable IDs
  const allVariableIds = variables.map((v) => v.id)
  const usedVariableIds = outputFormat.structure.flatMap((line) => line.variableIds || [])
  const invalidIds = usedVariableIds.filter((id) => !allVariableIds.includes(id))

  if (invalidIds.length > 0) {
    return `❌ Output format references unknown variables: ${invalidIds.join(", ")}`
  }

  const testcases: string[] = []

  for (let i = 0; i < count; i++) {
    console.log(`\n--- Generating testcase ${i + 1} ---`)

    const generatedValues: Record<string, any> = {}

    // Sort variables by dependencies (variables without dependencies first)
    const sortedVariables = topologicalSort(variables)
    console.log(
      "Sorted variables:",
      sortedVariables.map((v) => v.name),
    )

    // Generate values respecting dependencies
    for (const variable of sortedVariables) {
      const value = generateVariableValue(variable, generatedValues)
      generatedValues[variable.id] = value
      console.log(`Generated ${variable.name} (${variable.id}): ${JSON.stringify(value)}`)
    }

    // Format according to output format
    const testcaseLines: string[] = []

    for (const line of outputFormat.structure) {
      console.log(`Processing line:`, line)

      if (!line.variableIds || line.variableIds.length === 0) {
        console.log("Skipping empty line")
        continue
      }

      const lineValues: string[] = []

      for (const varId of line.variableIds) {
        const value = generatedValues[varId]
        console.log(`Looking up variable ${varId}: ${JSON.stringify(value)}`)

        if (value === undefined) {
          console.warn(`❌ Variable ${varId} not found in generated values`)
          continue
        }

        if (Array.isArray(value)) {
          lineValues.push(value.join(" "))
        } else {
          lineValues.push(String(value))
        }
      }

      if (lineValues.length === 0) {
        console.log("No values for this line, skipping")
        continue
      }

      let formattedLine = ""
      switch (line.type) {
        case "single":
          formattedLine = lineValues[0]
          break
        case "space_separated":
          formattedLine = lineValues.join(" ")
          break
        case "newline_separated":
          testcaseLines.push(...lineValues)
          continue // Don't add to formattedLine
        case "custom":
          formattedLine = lineValues.join(line.customSeparator || " ")
          break
        default:
          formattedLine = lineValues.join(" ")
      }

      if (formattedLine) {
        testcaseLines.push(formattedLine)
        console.log(`Added line: "${formattedLine}"`)
      }
    }

    const testcase = testcaseLines.join("\n")
    testcases.push(testcase)
    console.log(`Testcase ${i + 1} complete:\n${testcase}`)
  }

  const result = testcases.join("\n\n")
  console.log("=== FINAL RESULT ===")
  console.log(result)
  return result
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
    const deps = extractDependencies(variable)
    console.log(`Dependencies for ${variable.name}:`, deps)

    for (const depId of deps) {
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

function extractDependencies(variable: Variable): string[] {
  const deps: string[] = []

  switch (variable.constraint.type) {
    case "scalar":
      const scalarConstraint = variable.constraint as ScalarConstraint
      if (scalarConstraint.dependsOnValue?.variableId) {
        deps.push(scalarConstraint.dependsOnValue.variableId)
      }
      break

    case "array":
      const arrayConstraint = variable.constraint as ArrayConstraint
      if (arrayConstraint.linkedVariable) {
        deps.push(arrayConstraint.linkedVariable)
      }
      if (arrayConstraint.elementDependsOnValue?.variableId) {
        deps.push(arrayConstraint.elementDependsOnValue.variableId)
      }
      break

    // Add other constraint types as needed
  }

  return deps
}

function generateVariableValue(variable: Variable, existingValues: Record<string, any>): any {
  console.log(`Generating value for ${variable.name} (${variable.type})`)

  switch (variable.type) {
    case "int":
    case "float":
    case "double":
      return generateScalarValue(variable, existingValues)
    case "array":
      return generateArrayValue(variable, existingValues)
    case "string":
      return generateStringValue(variable, existingValues)
    default:
      console.warn(`Unknown variable type: ${variable.type}`)
      return Math.floor(Math.random() * 100) + 1
  }
}

function generateScalarValue(variable: Variable, existingValues: Record<string, any>): number {
  const constraint = variable.constraint as ScalarConstraint
  let min = constraint.min ?? 1
  let max = constraint.max ?? 100

  console.log(`Initial range for ${variable.name}: [${min}, ${max}]`)

  // Handle value dependencies
  if (constraint.dependsOnValue && constraint.dependsOnValue.variableId) {
    const dependentValue = existingValues[constraint.dependsOnValue.variableId]
    console.log(`Dependent value: ${dependentValue}`)

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
          console.log(`Equal to: ${exactValue}`)
          return exactValue
      }

      console.log(`Adjusted range for ${variable.name}: [${min}, ${max}]`)
    }
  }

  // Ensure min <= max
  if (min > max) {
    console.warn(`Invalid range for ${variable.name}: min(${min}) > max(${max}). Using min value.`)
    return min
  }

  const value = Math.floor(Math.random() * (max - min + 1)) + min
  console.log(`Generated scalar value: ${value}`)
  return value
}

function generateArrayValue(variable: Variable, existingValues: Record<string, any>): number[] {
  const constraint = variable.constraint as ArrayConstraint

  let size = constraint.minSize || 5

  // Handle linked size
  if (constraint.sizeType === "linked" && constraint.linkedVariable) {
    const linkedValue = existingValues[constraint.linkedVariable]
    if (linkedValue !== undefined) {
      size = linkedValue
    }
  }

  const elementMin = constraint.elementMin ?? 1
  const elementMax = constraint.elementMax ?? 100

  console.log(`Generating array of size ${size}, elements in [${elementMin}, ${elementMax}]`)

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
          // Add other relationships as needed
        }
      }
    }

    arr.push(elementValue)
  }

  console.log(`Generated array: [${arr.join(", ")}]`)
  return arr
}

function generateStringValue(variable: Variable, existingValues: Record<string, any>): string {
  // Simple string generation - can be enhanced later
  const length = Math.floor(Math.random() * 10) + 1
  const chars = "abcdefghijklmnopqrstuvwxyz"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
