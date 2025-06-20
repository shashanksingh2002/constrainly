"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react"
import type { Variable, VariableType } from "@/types/variable"
import { VariableCard } from "@/components/variable-card"

interface VariableBuilderProps {
  variables: Variable[]
  onAddVariable: (variable: Variable) => void
  onUpdateVariable: (id: string, updates: Partial<Variable>) => void
  onRemoveVariable: (id: string) => void
}

export function VariableBuilder({
  variables,
  onAddVariable,
  onUpdateVariable,
  onRemoveVariable,
}: VariableBuilderProps) {
  const [newVariableName, setNewVariableName] = useState("")
  const [newVariableType, setNewVariableType] = useState<VariableType>("int")

  const handleAddVariable = () => {
    if (!newVariableName.trim()) return

    const newVariable: Variable = {
      id: crypto.randomUUID(),
      name: newVariableName.trim(),
      type: newVariableType,
      constraint: getDefaultConstraint(newVariableType),
      dependencies: [],
    }

    onAddVariable(newVariable)
    setNewVariableName("")
    setNewVariableType("int")
  }

  const getDefaultConstraint = (type: VariableType) => {
    switch (type) {
      case "int":
      case "float":
      case "double":
        return { type: "scalar" as const }
      case "array":
        return { type: "array" as const, sizeType: "manual" as const }
      case "matrix":
        return { type: "matrix" as const, rowsType: "manual" as const, colsType: "manual" as const }
      case "string":
        return { type: "string" as const, lengthType: "manual" as const, charSet: "lowercase" as const }
      case "tree":
        return { type: "tree" as const, nodeCountType: "manual" as const, treeType: "binary" as const }
      case "graph":
        return {
          type: "graph" as const,
          nodesType: "manual" as const,
          edgesType: "manual" as const,
          graphType: "undirected" as const,
        }
      default:
        return { type: "scalar" as const }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold mb-4">Variable Definition</h2>

        {/* Add New Variable */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Variable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="variable-name">Variable Name</Label>
                <Input
                  id="variable-name"
                  placeholder="e.g., n, arr, matrix"
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddVariable()}
                />
              </div>
              <div>
                <Label htmlFor="variable-type">Type</Label>
                <Select value={newVariableType} onValueChange={(value: VariableType) => setNewVariableType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="int">Integer</SelectItem>
                    <SelectItem value="float">Float</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="matrix">Matrix</SelectItem>
                    <SelectItem value="tree">Tree</SelectItem>
                    <SelectItem value="graph">Graph</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddVariable} className="w-full" disabled={!newVariableName.trim()}>
              Add Variable
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Existing Variables */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 py-4">
          <div className="space-y-4">
            {variables.map((variable) => (
              <VariableCard
                key={variable.id}
                variable={variable}
                variables={variables}
                onUpdate={(updates) => onUpdateVariable(variable.id, updates)}
                onRemove={() => onRemoveVariable(variable.id)}
              />
            ))}
            {variables.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">No variables defined yet</p>
                <p className="text-sm">Add your first variable above to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
