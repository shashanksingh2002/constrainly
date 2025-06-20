"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  const updateDeps = () => {
    const deps: string[] = []
    if (constraint.nodeCountType === "linked" && constraint.linkedVariable) {
      deps.push(constraint.linkedVariable)
    }
    updateDependencies(deps)
  }

  return (
    <div className="space-y-6">
      {/* Tree Type */}
      <div>
        <Label className="text-sm font-medium">Tree Type</Label>
        <Select
          value={constraint.treeType}
          onValueChange={(value: "binary" | "nary" | "bst" | "avl" | "heap" | "trie") =>
            updateConstraint({ treeType: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="binary">Binary Tree</SelectItem>
            <SelectItem value="nary">N-ary Tree</SelectItem>
            <SelectItem value="bst">Binary Search Tree</SelectItem>
            <SelectItem value="avl">AVL Tree</SelectItem>
            <SelectItem value="heap">Heap (Min/Max)</SelectItem>
            <SelectItem value="trie">Trie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* N-ary specific configuration */}
      {constraint.treeType === "nary" && (
        <div>
          <Label>Maximum Children per Node</Label>
          <Input
            type="number"
            min="2"
            value={constraint.maxChildren || ""}
            onChange={(e) => updateConstraint({ maxChildren: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      )}

      {/* Heap specific configuration */}
      {constraint.treeType === "heap" && (
        <div>
          <Label>Heap Type</Label>
          <Select
            value={constraint.heapType || "min"}
            onValueChange={(value: "min" | "max") => updateConstraint({ heapType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="min">Min Heap</SelectItem>
              <SelectItem value="max">Max Heap</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Node Count Configuration */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Node Count</Label>
        <Select
          value={constraint.nodeCountType}
          onValueChange={(value: "manual" | "linked") => {
            updateConstraint({ nodeCountType: value })
            updateDeps()
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Range</SelectItem>
            <SelectItem value="linked">Linked to Variable</SelectItem>
          </SelectContent>
        </Select>

        {constraint.nodeCountType === "manual" ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Nodes</Label>
              <Input
                type="number"
                min="1"
                value={constraint.minNodes || ""}
                onChange={(e) => updateConstraint({ minNodes: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label>Max Nodes</Label>
              <Input
                type="number"
                min="1"
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
                updateDeps()
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variable for node count" />
              </SelectTrigger>
              <SelectContent>
                {availableVariables
                  .filter((v) => ["int", "float", "double"].includes(v.type))
                  .map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Tree Structure Constraints */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Structure Constraints</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Max Depth</Label>
            <Input
              type="number"
              min="1"
              value={constraint.maxDepth || ""}
              onChange={(e) => updateConstraint({ maxDepth: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Min Depth</Label>
            <Input
              type="number"
              min="1"
              value={constraint.minDepth || ""}
              onChange={(e) => updateConstraint({ minDepth: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      {/* Node Value Constraints */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Node Value Constraints</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Value</Label>
            <Input
              type="number"
              value={constraint.minValue || ""}
              onChange={(e) => updateConstraint({ minValue: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Max Value</Label>
            <Input
              type="number"
              value={constraint.maxValue || ""}
              onChange={(e) => updateConstraint({ maxValue: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      {/* Tree Properties */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tree Properties</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="balanced"
              checked={constraint.balanced || false}
              onCheckedChange={(checked) => updateConstraint({ balanced: !!checked })}
            />
            <Label htmlFor="balanced">Balanced</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="complete"
              checked={constraint.complete || false}
              onCheckedChange={(checked) => updateConstraint({ complete: !!checked })}
            />
            <Label htmlFor="complete">Complete</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="full"
              checked={constraint.full || false}
              onCheckedChange={(checked) => updateConstraint({ full: !!checked })}
            />
            <Label htmlFor="full">Full</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="perfect"
              checked={constraint.perfect || false}
              onCheckedChange={(checked) => updateConstraint({ perfect: !!checked })}
            />
            <Label htmlFor="perfect">Perfect</Label>
          </div>
        </div>
      </div>

      {/* Custom Rules */}
      <div>
        <Label htmlFor="tree-rules">Custom Tree Rules (Optional)</Label>
        <Textarea
          id="tree-rules"
          placeholder="e.g., all leaf nodes at same level, specific traversal properties"
          value={constraint.customRules || ""}
          onChange={(e) => updateConstraint({ customRules: e.target.value })}
          className="mt-1"
        />
      </div>
    </div>
  )
}
