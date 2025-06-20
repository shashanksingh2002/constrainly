import type { Variable } from "@/types/variables"

export interface ValidationIssue {
  variableName: string
  message: string
}

export function validateConstraints(variables: Variable[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  variables.forEach((variable) => {
    // Validate scalar constraints
    if (variable.constraint.type === "scalar") {
      const constraint = variable.constraint
      if (constraint.min !== undefined && constraint.max !== undefined && constraint.min > constraint.max) {
        issues.push({
          variableName: variable.name,
          message: "Min value is greater than max value",
        })
      }
    }

    // Validate dependencies
    if (variable.dependencies.length > 0) {
      variable.dependencies.forEach((depId) => {
        const depVar = variables.find((v) => v.id === depId)
        if (!depVar) {
          issues.push({
            variableName: variable.name,
            message: "References unknown variable",
          })
        }
      })
    }

    // Add more validation rules as needed
  })

  return issues
}
