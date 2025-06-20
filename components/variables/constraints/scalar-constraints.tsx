"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ScalarConstraint, Variable, VariableConstraint } from "@/types/variables"

interface ScalarConstraintsProps {
  constraint: ScalarConstraint
  availableVariables: Variable[]
  updateConstraint: (updates: Partial<VariableConstraint>) => void
  updateDependencies: (deps: string[]) => void
}

export function ScalarConstraints({ constraint, updateConstraint }: ScalarConstraintsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min Value</Label>
          <Input
            type="number"
            placeholder="e.g., 1"
            value={constraint.min || ""}
            onChange={(e) => updateConstraint({ min: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <Label>Max Value</Label>
          <Input
            type="number"
            placeholder="e.g., 1000"
            value={constraint.max || ""}
            onChange={(e) => updateConstraint({ max: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>
      <div>
        <Label>Custom Logic (optional)</Label>
        <Input
          placeholder="e.g., n % 3 == 0, x != y"
          value={constraint.customLogic || ""}
          onChange={(e) => updateConstraint({ customLogic: e.target.value })}
        />
      </div>
    </div>
  )
}
