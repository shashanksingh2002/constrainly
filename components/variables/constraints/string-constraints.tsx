"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StringConstraint, Variable, VariableConstraint } from "@/types/variables"

interface StringConstraintsProps {
  constraint: StringConstraint
  availableVariables: Variable[]
  updateConstraint: (updates: Partial<VariableConstraint>) => void
  updateDependencies: (deps: string[]) => void
}

export function StringConstraints({
  constraint,
  availableVariables,
  updateConstraint,
  updateDependencies,
}: StringConstraintsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Length Type</Label>
        <Select
          value={constraint.lengthType}
          onValueChange={(value: "manual" | "linked") => updateConstraint({ lengthType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Range</SelectItem>
            <SelectItem value="linked">Linked to Variable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {constraint.lengthType === "manual" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Length</Label>
            <Input
              type="number"
              value={constraint.minLength || ""}
              onChange={(e) => updateConstraint({ minLength: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Max Length</Label>
            <Input
              type="number"
              value={constraint.maxLength || ""}
              onChange={(e) => updateConstraint({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      ) : (
        <div>
          <Label>Linked Variable</Label>
          <Select
            value={constraint.linkedVariable || ""}
            onValueChange={(value) => {
              updateConstraint({ linkedVariable: value })
              const deps = value ? [value] : []
              updateDependencies(deps)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select variable" />
            </SelectTrigger>
            <SelectContent>
              {availableVariables.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Character Set</Label>
        <Select value={constraint.charSet} onValueChange={(value: any) => updateConstraint({ charSet: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lowercase">Lowercase (a-z)</SelectItem>
            <SelectItem value="uppercase">Uppercase (A-Z)</SelectItem>
            <SelectItem value="digits">Digits (0-9)</SelectItem>
            <SelectItem value="alphanumeric">Alphanumeric</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {constraint.charSet === "custom" && (
        <div>
          <Label>Custom Character Set</Label>
          <Input
            placeholder="e.g., abcdef123"
            value={constraint.customCharSet || ""}
            onChange={(e) => updateConstraint({ customCharSet: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}
