"use server"

import type { Variable, OutputFormat } from "@/types/variables"
import { GenerationLogger } from "@/lib/utils/generation-logger"
import { topologicalSort } from "@/lib/utils/dependency-resolver"
import { generateVariableValue } from "@/lib/generators"
import { formatOutput } from "@/lib/formatters/output-formatter"

export const generateTestcases = async (
  variables: Variable[],
  count: number,
  outputFormat: OutputFormat,
): Promise<string> => {
  GenerationLogger.section("TESTCASE GENERATION")
  GenerationLogger.log(
    "Variables:",
    variables.map((v) => ({ id: v.id, name: v.name, type: v.type })),
  )
  GenerationLogger.log("Output Format:", outputFormat.name)
  GenerationLogger.log("Count:", count)

  // Validation
  if (variables.length === 0) {
    return "❌ No variables defined. Please add some variables first."
  }

  if (!outputFormat.structure || outputFormat.structure.length === 0) {
    return "❌ No output format defined. Please set up the output format."
  }

  // Validate output format references
  const allVariableIds = variables.map((v) => v.id)
  const usedVariableIds = outputFormat.structure.flatMap((line) => line.variableIds || [])
  const invalidIds = usedVariableIds.filter((id) => !allVariableIds.includes(id))

  if (invalidIds.length > 0) {
    return `❌ Output format references unknown variables: ${invalidIds.join(", ")}`
  }

  const testcases: string[] = []

  for (let i = 0; i < count; i++) {
    GenerationLogger.subsection(`Generating testcase ${i + 1}`)

    const generatedValues: Record<string, any> = {}

    // Sort variables by dependencies
    const sortedVariables = topologicalSort(variables)
    GenerationLogger.log(
      "Sorted variables:",
      sortedVariables.map((v) => v.name),
    )

    // Generate values respecting dependencies
    GenerationLogger.withIndent(() => {
      for (const variable of sortedVariables) {
        const value = generateVariableValue(variable, generatedValues)
        generatedValues[variable.id] = value
        GenerationLogger.success(`Generated ${variable.name}: ${JSON.stringify(value)}`)
      }
    })

    // Format output
    const testcase = formatOutput(generatedValues, variables, outputFormat)
    testcases.push(testcase)

    GenerationLogger.success(`Testcase ${i + 1} complete:\n${testcase}`)
  }

  const result = testcases.join("\n\n")
  GenerationLogger.section("GENERATION COMPLETE")
  GenerationLogger.log("Final result length:", result.length)
  return result
}
