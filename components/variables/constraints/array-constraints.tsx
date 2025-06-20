"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { ArrayConstraint, Variable, VariableConstraint } from "@/types/variables"

interface ArrayConstraintsProps {
  constraint: ArrayConstraint
  availableVariables: Variable[]
  updateConstraint: (updates: Partial<VariableConstraint>) => void
  updateDependencies: (deps: string[]) => void
}

export function ArrayConstraints({
  constraint,
  availableVariables,
  updateConstraint,
  updateDependencies,
}: ArrayConstraintsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Array Size</Label>
        <Select
          value={constraint.sizeType}
          onValueChange={(value: "manual" | "linked") => updateConstraint({ sizeType: value })}
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

      {constraint.sizeType === "manual" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Size</Label>
            <Input
              type="number"
              value={constraint.minSize || ""}
              onChange={(e) => updateConstraint({ minSize: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Max Size</Label>
            <Input
              type="number"
              value={constraint.maxSize || ""}
              onChange={(e) => updateConstraint({ maxSize: e.target.value ? Number(e.target.value) : undefined })}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Element Min</Label>
          <Input
            type="number"
            value={constraint.elementMin || ""}
            onChange={(e) => updateConstraint({ elementMin: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <Label>Element Max</Label>
          <Input
            type="number"
            value={constraint.elementMax || ""}
            onChange={(e) => updateConstraint({ elementMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="distinct"
            checked={constraint.distinct || false}
            onCheckedChange={(checked) => updateConstraint({ distinct: !!checked })}
          />
          <Label htmlFor="distinct">Distinct elements</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sorted"
            checked={constraint.sorted || false}
            onCheckedChange={(checked) => updateConstraint({ sorted: !!checked })}
          />
          <Label htmlFor="sorted">Sorted</Label>
        </div>
      </div>
    </div>
  )
}
