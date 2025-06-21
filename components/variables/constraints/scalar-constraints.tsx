"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ScalarConstraint, Variable, VariableConstraint } from "@/types/variables"

interface ScalarConstraintsProps {
  constraint: ScalarConstraint
  availableVariables: Variable[]
  updateConstraint: (updates: Partial<VariableConstraint>) => void
  updateDependencies: (deps: string[]) => void
}

export function ScalarConstraints({
  constraint,
  availableVariables,
  updateConstraint,
  updateDependencies,
}: ScalarConstraintsProps) {
  const handleDependencyChange = (enabled: boolean) => {
    if (enabled) {
      updateConstraint({
        dependsOnValue: {
          variableId: "",
          relationship: "less_equal",
          multiplier: 1,
          offset: 0,
        },
      })
    } else {
      updateConstraint({ dependsOnValue: undefined })
      updateDependencies([])
    }
  }

  const handleDependencyUpdate = (field: string, value: any) => {
    if (!constraint.dependsOnValue) return

    const updated = { ...constraint.dependsOnValue, [field]: value }
    updateConstraint({ dependsOnValue: updated })

    // Update dependencies array
    if (field === "variableId" && value) {
      updateDependencies([value])
    }
  }

  const scalarVariables = availableVariables.filter((v) => ["int", "float", "double"].includes(v.type))

  return (
    <div className="space-y-4">
      {/* Basic Range */}
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

      {/* Value Dependencies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Value Dependencies</CardTitle>
            <Switch checked={!!constraint.dependsOnValue} onCheckedChange={handleDependencyChange} />
          </div>
        </CardHeader>
        {constraint.dependsOnValue && (
          <CardContent className="pt-0 space-y-3">
            <div>
              <Label>Depends on Variable</Label>
              <Select
                value={constraint.dependsOnValue.variableId}
                onValueChange={(value) => handleDependencyUpdate("variableId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  {scalarVariables.map((variable) => (
                    <SelectItem key={variable.id} value={variable.id}>
                      {variable.name} ({variable.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Relationship</Label>
              <Select
                value={constraint.dependsOnValue.relationship}
                onValueChange={(value) => handleDependencyUpdate("relationship", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less_than">Less than (&lt;)</SelectItem>
                  <SelectItem value="less_equal">Less than or equal (≤)</SelectItem>
                  <SelectItem value="greater_than">Greater than (&gt;)</SelectItem>
                  <SelectItem value="greater_equal">Greater than or equal (≥)</SelectItem>
                  <SelectItem value="equal_to">Equal to (=)</SelectItem>
                  <SelectItem value="multiple_of">Multiple of</SelectItem>
                  <SelectItem value="factor_of">Factor of</SelectItem>
                  <SelectItem value="custom">Custom formula</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {constraint.dependsOnValue.relationship === "custom" ? (
              <div>
                <Label>Custom Formula</Label>
                <Input
                  placeholder="e.g., n/2 + 1, n*2-1"
                  value={constraint.dependsOnValue.customFormula || ""}
                  onChange={(e) => handleDependencyUpdate("customFormula", e.target.value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="1"
                    value={constraint.dependsOnValue.multiplier || ""}
                    onChange={(e) => handleDependencyUpdate("multiplier", e.target.value ? Number(e.target.value) : 1)}
                  />
                </div>
                <div>
                  <Label>Offset</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={constraint.dependsOnValue.offset || ""}
                    onChange={(e) => handleDependencyUpdate("offset", e.target.value ? Number(e.target.value) : 0)}
                  />
                </div>
              </div>
            )}

            {constraint.dependsOnValue.variableId && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                <strong>Preview:</strong> This variable will be{" "}
                {constraint.dependsOnValue.relationship === "less_than" && "less than"}
                {constraint.dependsOnValue.relationship === "less_equal" && "less than or equal to"}
                {constraint.dependsOnValue.relationship === "greater_than" && "greater than"}
                {constraint.dependsOnValue.relationship === "greater_equal" && "greater than or equal to"}
                {constraint.dependsOnValue.relationship === "equal_to" && "equal to"}
                {constraint.dependsOnValue.relationship === "multiple_of" && "a multiple of"}
                {constraint.dependsOnValue.relationship === "factor_of" && "a factor of"} the selected variable
                {constraint.dependsOnValue.multiplier !== 1 && ` × ${constraint.dependsOnValue.multiplier}`}
                {constraint.dependsOnValue.offset !== 0 &&
                  ` ${constraint.dependsOnValue.offset >= 0 ? "+" : ""}${constraint.dependsOnValue.offset}`}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Custom Logic */}
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
