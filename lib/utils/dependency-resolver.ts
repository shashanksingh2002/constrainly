import type { Variable, ScalarConstraint, ArrayConstraint, MatrixConstraint } from "@/types/variables"
import { GenerationLogger } from "./generation-logger"

export function topologicalSort(variables: Variable[]): Variable[] {
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
    GenerationLogger.debug(`Dependencies for ${variable.name}:`, deps)

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

export function extractDependencies(variable: Variable): string[] {
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

    case "matrix":
      const matrixConstraint = variable.constraint as MatrixConstraint
      if (matrixConstraint.linkedRowVariable) {
        deps.push(matrixConstraint.linkedRowVariable)
      }
      if (matrixConstraint.linkedColVariable) {
        deps.push(matrixConstraint.linkedColVariable)
      }
      break
  }

  return deps
}
