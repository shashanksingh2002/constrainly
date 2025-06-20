"use client"

import type { Variable, VariableConstraint } from "@/types/variables"
import { ScalarConstraints } from "./scalar-constraints"
import { ArrayConstraints } from "./array-constraints"
import { MatrixConstraints } from "./matrix-constraints"
import { StringConstraints } from "./string-constraints"
import { TreeConstraints } from "./tree-constraints"
import { GraphConstraints } from "./graph-constraints"

interface ConstraintBuilderProps {
  variable: Variable
  variables: Variable[]
  onUpdate: (updates: Partial<Variable>) => void
}

export function ConstraintBuilder({ variable, variables, onUpdate }: ConstraintBuilderProps) {
  const updateConstraint = (updates: Partial<VariableConstraint>) => {
    onUpdate({
      constraint: { ...variable.constraint, ...updates },
    })
  }

  const updateDependencies = (newDeps: string[]) => {
    onUpdate({ dependencies: newDeps })
  }

  const availableVariables = variables.filter((v) => v.id !== variable.id)

  const commonProps = {
    constraint: variable.constraint,
    availableVariables,
    updateConstraint,
    updateDependencies,
  }

  switch (variable.constraint.type) {
    case "scalar":
      return <ScalarConstraints {...commonProps} />
    case "array":
      return <ArrayConstraints {...commonProps} />
    case "matrix":
      return <MatrixConstraints {...commonProps} />
    case "string":
      return <StringConstraints {...commonProps} />
    case "tree":
      return <TreeConstraints {...commonProps} />
    case "graph":
      return <GraphConstraints {...commonProps} />
    default:
      return <div>Constraint builder for {variable.constraint.type} not implemented</div>
  }
}
