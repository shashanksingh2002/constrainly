"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Variable, VariableConstraint } from "@/types/variable"

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

  switch (variable.constraint.type) {
    case "scalar":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Value</Label>
              <Input
                type="number"
                placeholder="e.g., 1"
                value={variable.constraint.min || ""}
                onChange={(e) => updateConstraint({ min: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label>Max Value</Label>
              <Input
                type="number"
                placeholder="e.g., 1000"
                value={variable.constraint.max || ""}
                onChange={(e) => updateConstraint({ max: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
          <div>
            <Label>Custom Logic (optional)</Label>
            <Input
              placeholder="e.g., n % 3 == 0, x != y"
              value={variable.constraint.customLogic || ""}
              onChange={(e) => updateConstraint({ customLogic: e.target.value })}
            />
          </div>
        </div>
      )

    case "array":
      return (
        <div className="space-y-4">
          <div>
            <Label>Array Size</Label>
            <Select
              value={variable.constraint.sizeType}
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

          {variable.constraint.sizeType === "manual" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Size</Label>
                <Input
                  type="number"
                  value={variable.constraint.minSize || ""}
                  onChange={(e) => updateConstraint({ minSize: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div>
                <Label>Max Size</Label>
                <Input
                  type="number"
                  value={variable.constraint.maxSize || ""}
                  onChange={(e) => updateConstraint({ maxSize: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          ) : (
            <div>
              <Label>Linked Variable</Label>
              <Select
                value={variable.constraint.linkedVariable || ""}
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
                value={variable.constraint.elementMin || ""}
                onChange={(e) => updateConstraint({ elementMin: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label>Element Max</Label>
              <Input
                type="number"
                value={variable.constraint.elementMax || ""}
                onChange={(e) => updateConstraint({ elementMax: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="distinct"
                checked={variable.constraint.distinct || false}
                onCheckedChange={(checked) => updateConstraint({ distinct: !!checked })}
              />
              <Label htmlFor="distinct">Distinct elements</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sorted"
                checked={variable.constraint.sorted || false}
                onCheckedChange={(checked) => updateConstraint({ sorted: !!checked })}
              />
              <Label htmlFor="sorted">Sorted</Label>
            </div>
          </div>
        </div>
      )

    case "string":
      return (
        <div className="space-y-4">
          <div>
            <Label>Length Type</Label>
            <Select
              value={variable.constraint.lengthType}
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

          {variable.constraint.lengthType === "manual" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Length</Label>
                <Input
                  type="number"
                  value={variable.constraint.minLength || ""}
                  onChange={(e) => updateConstraint({ minLength: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div>
                <Label>Max Length</Label>
                <Input
                  type="number"
                  value={variable.constraint.maxLength || ""}
                  onChange={(e) => updateConstraint({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          ) : (
            <div>
              <Label>Linked Variable</Label>
              <Select
                value={variable.constraint.linkedVariable || ""}
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
            <Select
              value={variable.constraint.charSet}
              onValueChange={(value: any) => updateConstraint({ charSet: value })}
            >
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

          {variable.constraint.charSet === "custom" && (
            <div>
              <Label>Custom Character Set</Label>
              <Input
                placeholder="e.g., abcdef123"
                value={variable.constraint.customCharSet || ""}
                onChange={(e) => updateConstraint({ customCharSet: e.target.value })}
              />
            </div>
          )}
        </div>
      )

    case "tree":
      return (
        <div className="space-y-4">
          <div>
            <Label>Node Count Type</Label>
            <Select
              value={variable.constraint.nodeCountType}
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

          {variable.constraint.nodeCountType === "manual" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Nodes</Label>
                <Input
                  type="number"
                  value={variable.constraint.minNodes || ""}
                  onChange={(e) => updateConstraint({ minNodes: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div>
                <Label>Max Nodes</Label>
                <Input
                  type="number"
                  value={variable.constraint.maxNodes || ""}
                  onChange={(e) => updateConstraint({ maxNodes: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          ) : (
            <div>
              <Label>Linked Variable</Label>
              <Select
                value={variable.constraint.linkedVariable || ""}
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
              value={variable.constraint.treeType}
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

    case "graph":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Graph Type</Label>
              <Select
                value={variable.constraint.graphType}
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
                value={variable.constraint.maxDegree || ""}
                onChange={(e) => updateConstraint({ maxDegree: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Nodes</Label>
              <Input
                type="number"
                value={variable.constraint.minNodes || ""}
                onChange={(e) => updateConstraint({ minNodes: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label>Max Nodes</Label>
              <Input
                type="number"
                value={variable.constraint.maxNodes || ""}
                onChange={(e) => updateConstraint({ maxNodes: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="connected"
                checked={variable.constraint.connected || false}
                onCheckedChange={(checked) => updateConstraint({ connected: !!checked })}
              />
              <Label htmlFor="connected">Connected</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weighted"
                checked={variable.constraint.weighted || false}
                onCheckedChange={(checked) => updateConstraint({ weighted: !!checked })}
              />
              <Label htmlFor="weighted">Weighted</Label>
            </div>
          </div>
        </div>
      )

    default:
      return <div>Constraint builder for {variable.constraint.type} not implemented</div>
  }
}
