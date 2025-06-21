import type {
  Variable,
  ScalarConstraint,
  ArrayConstraint,
  MatrixConstraint,
  TreeConstraint,
  GraphConstraint,
} from "@/types/variables"
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

    case "tree":
      const treeConstraint = variable.constraint as TreeConstraint
      if (treeConstraint.nodeCountType === "linked" && treeConstraint.linkedNodeVariable) {
        deps.push(treeConstraint.linkedNodeVariable)
      }
      if (treeConstraint.nodeValueDependsOn?.variableId) {
        deps.push(treeConstraint.nodeValueDependsOn.variableId)
      }
      break

    case "graph":
      const graphConstraint = variable.constraint as GraphConstraint
      if (graphConstraint.nodeCountType === "linked" && graphConstraint.linkedNodeVariable) {
        deps.push(graphConstraint.linkedNodeVariable)
      }
      if (graphConstraint.edgeCountType === "linked" && graphConstraint.linkedEdgeVariable) {
        deps.push(graphConstraint.linkedEdgeVariable)
      }
      if (graphConstraint.nodeValueDependsOn?.variableId) {
        deps.push(graphConstraint.nodeValueDependsOn.variableId)
      }
      if (graphConstraint.edgeWeightDependsOn?.variableId) {
        deps.push(graphConstraint.edgeWeightDependsOn.variableId)
      }
      break
  }

  return deps
}
