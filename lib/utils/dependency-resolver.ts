import type { Variable, ScalarConstraint, ArrayConstraint, MatrixConstraint } from "@/types/variables"
import { GenerationLogger } from "./generation-logger"

/*
  Extracts the variable‐IDs a variable depends on.
*/
export function extractDependencies(variable: Variable): string[] {
  const deps: string[] = []

  switch (variable.constraint.type) {
    case "scalar": {
      const c = variable.constraint as ScalarConstraint
      if (c.dependsOnValue?.variableId) deps.push(c.dependsOnValue.variableId)
      break
    }
    case "array": {
      const c = variable.constraint as ArrayConstraint
      if (c.linkedVariable) deps.push(c.linkedVariable)
      if (c.elementDependsOnValue?.variableId) deps.push(c.elementDependsOnValue.variableId)
      break
    }
    case "matrix": {
      const c = variable.constraint as MatrixConstraint
      if (c.linkedRowVariable) deps.push(c.linkedRowVariable)
      if (c.linkedColVariable) deps.push(c.linkedColVariable)
      break
    }
  }

  return deps
}

/*
  Topologically sort variables so every dependency is generated first.
*/
export function topologicalSort(variables: Variable[]): Variable[] {
  const sorted: Variable[] = []
  const visiting = new Set<string>()
  const visited = new Set<string>()

  function visit(v: Variable) {
    if (visited.has(v.id)) return
    if (visiting.has(v.id)) {
      throw new Error(`Circular dependency detected involving ${v.name}`)
    }

    visiting.add(v.id)
    const deps = extractDependencies(v)
    GenerationLogger.debug(`Dependencies for ${v.name}:`, deps)

    deps.forEach((id) => {
      const depVar = variables.find((x) => x.id === id)
      if (depVar) visit(depVar)
    })

    visiting.delete(v.id)
    visited.add(v.id)
    sorted.push(v)
  }

  variables.forEach((v) => visit(v))
  return sorted
}
