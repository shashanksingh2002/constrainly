"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react"
import type { Variable, VariableType } from "@/types/variables"
import { VARIABLE_TYPE_LABELS } from "@/lib/constants/variable-types"
import { getDefaultConstraint } from "@/lib/utils/constraint-defaults"
import { VariableCard } from "./variable-card"
import { EmptyVariableState } from "./empty-variable-state"

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

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold mb-4">Variable Definition</h2>

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
                    {Object.entries(VARIABLE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
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
            {variables.length === 0 && <EmptyVariableState />}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
