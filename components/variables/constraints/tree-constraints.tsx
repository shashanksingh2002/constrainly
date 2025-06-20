"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TreeConstraint, Variable, VariableConstraint } from "@/types/variables"

interface TreeConstraintsProps {
  constraint: TreeConstraint
  availableVariables: Variable[]
  updateConstraint: (updates: Partial<VariableConstraint>) => void
  updateDependencies: (deps: string[]) => void
}

export function TreeConstraints({
  constraint,
  availableVariables,
  updateConstraint,
  updateDependencies,
}: TreeConstraintsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Node Count Type</Label>
        <Select
          value={constraint.nodeCountType}
          onValueChange={(value: "manual" | "linked") => updateConstraint({ nodeCountType: value })}
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

      {constraint.nodeCountType === "manual" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Nodes</Label>
            <Input
              type="number"
              value={constraint.minNodes || ""}
              onChange={(e) => updateConstraint({ minNodes: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Max Nodes</Label>
            <Input
              type="number"
              value={constraint.maxNodes || ""}
              onChange={(e) => updateConstraint({ maxNodes: e.target.value ? Number(e.target.value) : undefined })}
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
        <Label>Tree Type</Label>
        <Select
          value={constraint.treeType}
          onValueChange={(value: "binary" | "nary") => updateConstraint({ treeType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="binary">Binary Tree</SelectItem>
            <SelectItem value="nary">N-ary Tree</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
