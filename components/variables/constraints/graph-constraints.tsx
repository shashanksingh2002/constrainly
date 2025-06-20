"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { GraphConstraint, Variable, VariableConstraint } from "@/types/variables"

interface GraphConstraintsProps {
  constraint: GraphConstraint
  availableVariables: Variable[]
  updateConstraint: (updates: Partial<VariableConstraint>) => void
  updateDependencies: (deps: string[]) => void
}

export function GraphConstraints({
  constraint,
  availableVariables,
  updateConstraint,
  updateDependencies,
}: GraphConstraintsProps) {
  const updateDeps = () => {
    const deps: string[] = []
    if (constraint.nodesType === "linked" && constraint.linkedNodeVariable) {
      deps.push(constraint.linkedNodeVariable)
    }
    if (constraint.edgesType === "linked" && constraint.linkedEdgeVariable) {
      deps.push(constraint.linkedEdgeVariable)
    }
    updateDependencies(deps)
  }

  return (
    <div className="space-y-6">
      {/* Graph Type */}
      <div>
        <Label className="text-sm font-medium">Graph Type</Label>
        <Select
          value={constraint.graphType}
          onValueChange={(value: "directed" | "undirected" | "dag" | "tree" | "bipartite" | "complete") =>
            updateConstraint({ graphType: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undirected">Undirected Graph</SelectItem>
            <SelectItem value="directed">Directed Graph</SelectItem>
            <SelectItem value="dag">Directed Acyclic Graph (DAG)</SelectItem>
            <SelectItem value="tree">Tree Graph</SelectItem>
            <SelectItem value="bipartite">Bipartite Graph</SelectItem>
            <SelectItem value="complete">Complete Graph</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Nodes Configuration */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Nodes Configuration</Label>
        <Select
          value={constraint.nodesType}
          onValueChange={(value: "manual" | "linked") => {
            updateConstraint({ nodesType: value })
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

        {constraint.nodesType === "manual" ? (
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
              value={constraint.linkedNodeVariable || ""}
              onValueChange={(value) => {
                updateConstraint({ linkedNodeVariable: value })
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

      {/* Edges Configuration */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Edges Configuration</Label>
        <Select
          value={constraint.edgesType}
          onValueChange={(value: "manual" | "linked") => {
            updateConstraint({ edgesType: value })
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

        {constraint.edgesType === "manual" ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Edges</Label>
              <Input
                type="number"
                min="0"
                value={constraint.minEdges || ""}
                onChange={(e) => updateConstraint({ minEdges: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label>Max Edges</Label>
              <Input
                type="number"
                min="0"
                value={constraint.maxEdges || ""}
                onChange={(e) => updateConstraint({ maxEdges: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
        ) : (
          <div>
            <Label>Linked Variable</Label>
            <Select
              value={constraint.linkedEdgeVariable || ""}
              onValueChange={(value) => {
                updateConstraint({ linkedEdgeVariable: value })
                updateDeps()
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variable for edge count" />
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

      {/* Graph Properties */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Graph Properties</Label>
        <div className="grid grid-cols-2 gap-4">
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cyclic"
              checked={constraint.cyclic || false}
              onCheckedChange={(checked) => updateConstraint({ cyclic: !!checked })}
            />
            <Label htmlFor="cyclic">Allow Cycles</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="self-loops"
              checked={constraint.selfLoops || false}
              onCheckedChange={(checked) => updateConstraint({ selfLoops: !!checked })}
            />
            <Label htmlFor="self-loops">Allow Self Loops</Label>
          </div>
        </div>
      </div>

      {/* Degree Constraints */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Degree Constraints</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Max Degree</Label>
            <Input
              type="number"
              min="1"
              value={constraint.maxDegree || ""}
              onChange={(e) => updateConstraint({ maxDegree: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Min Degree</Label>
            <Input
              type="number"
              min="0"
              value={constraint.minDegree || ""}
              onChange={(e) => updateConstraint({ minDegree: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      {/* Weight Constraints (if weighted) */}
      {constraint.weighted && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Edge Weight Constraints</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Weight</Label>
              <Input
                type="number"
                value={constraint.minWeight || ""}
                onChange={(e) => updateConstraint({ minWeight: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label>Max Weight</Label>
              <Input
                type="number"
                value={constraint.maxWeight || ""}
                onChange={(e) => updateConstraint({ maxWeight: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Node Value Constraints */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Node Value Constraints</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Node Value</Label>
            <Input
              type="number"
              value={constraint.minNodeValue || ""}
              onChange={(e) => updateConstraint({ minNodeValue: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Max Node Value</Label>
            <Input
              type="number"
              value={constraint.maxNodeValue || ""}
              onChange={(e) => updateConstraint({ maxNodeValue: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      {/* Custom Rules */}
      <div>
        <Label htmlFor="graph-rules">Custom Graph Rules (Optional)</Label>
        <Textarea
          id="graph-rules"
          placeholder="e.g., specific connectivity patterns, planarity constraints"
          value={constraint.customRules || ""}
          onChange={(e) => updateConstraint({ customRules: e.target.value })}
          className="mt-1"
        />
      </div>
    </div>
  )
}
