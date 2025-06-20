"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { GraphConstraint, Variable, VariableConstraint } from "@/types/variables"

interface GraphConstraintsProps {
  constraint: GraphConstraint
  availableVariables: Variable[]
  updateConstraint: (updates: Partial<VariableConstraint>) => void
  updateDependencies: (deps: string[]) => void
}

export function GraphConstraints({ constraint, updateConstraint }: GraphConstraintsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Graph Type</Label>
          <Select
            value={constraint.graphType}
            onValueChange={(value: "directed" | "undirected") => updateConstraint({ graphType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undirected">Undirected</SelectItem>
              <SelectItem value="directed">Directed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Max Degree</Label>
          <Input
            type="number"
            placeholder="Optional"
            value={constraint.maxDegree || ""}
            onChange={(e) => updateConstraint({ maxDegree: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

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

      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="connected"
            checked={constraint.connected || false}
            onCheckedChange={(checked) => updateConstraint({ connected: !!checked })}
          />
          <Label htmlFor="connected">Connected</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="weighted"
            checked={constraint.weighted || false}
            onCheckedChange={(checked) => updateConstraint({ weighted: !!checked })}
          />
          <Label htmlFor="weighted">Weighted</Label>
        </div>
      </div>
    </div>
  )
}
