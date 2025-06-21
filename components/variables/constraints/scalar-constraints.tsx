"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"
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
  const hasDependency = !!constraint.dependsOnValue
  const dependentVariable = hasDependency
    ? availableVariables.find((v) => v.id === constraint.dependsOnValue?.variableId)
    : null

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

  // Determine which range inputs should be disabled/modified based on dependency
  const getRangeConstraints = () => {
    if (!hasDependency || !constraint.dependsOnValue?.variableId) {
      return { showMin: true, showMax: true, minDisabled: false, maxDisabled: false }
    }

    const relationship = constraint.dependsOnValue.relationship
    switch (relationship) {
      case "less_than":
      case "less_equal":
        return {
          showMin: true,
          showMax: false,
          minDisabled: false,
          maxDisabled: true,
          maxNote: `Max value is dynamically set by ${dependentVariable?.name || "dependent variable"}`,
        }
      case "greater_than":
      case "greater_equal":
        return {
          showMin: false,
          showMax: true,
          minDisabled: true,
          maxDisabled: false,
          minNote: `Min value is dynamically set by ${dependentVariable?.name || "dependent variable"}`,
        }
      case "equal_to":
        return {
          showMin: false,
          showMax: false,
          minDisabled: true,
          maxDisabled: true,
          note: `Value is dynamically set to equal ${dependentVariable?.name || "dependent variable"}`,
        }
      case "multiple_of":
      case "factor_of":
        return {
          showMin: true,
          showMax: true,
          minDisabled: false,
          maxDisabled: false,
          note: `Range applies to the generated multiples/factors`,
        }
      case "custom":
        return {
          showMin: true,
          showMax: true,
          minDisabled: false,
          maxDisabled: false,
          note: `Range applies as additional constraints to the custom formula`,
        }
      default:
        return { showMin: true, showMax: true, minDisabled: false, maxDisabled: false }
    }
  }

  const rangeConstraints = getRangeConstraints()

  const getRelationshipDescription = () => {
    if (!constraint.dependsOnValue?.variableId || !dependentVariable) return ""

    const rel = constraint.dependsOnValue.relationship
    const varName = dependentVariable.name
    const mult = constraint.dependsOnValue.multiplier || 1
    const offset = constraint.dependsOnValue.offset || 0

    let base = ""
    switch (rel) {
      case "less_than":
        base = `< ${varName}`
        break
      case "less_equal":
        base = `≤ ${varName}`
        break
      case "greater_than":
        base = `> ${varName}`
        break
      case "greater_equal":
        base = `≥ ${varName}`
        break
      case "equal_to":
        base = `= ${varName}`
        break
      case "multiple_of":
        base = `multiple of ${varName}`
        break
      case "factor_of":
        base = `factor of ${varName}`
        break
      case "custom":
        return constraint.dependsOnValue.customFormula || "custom formula"
    }

    if (mult !== 1) base = base.replace(varName, `${mult} × ${varName}`)
    if (offset !== 0) base += ` ${offset >= 0 ? "+" : ""}${offset}`

    return base
  }

  return (
    <div className="space-y-4">
      {/* Value Dependencies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Value Dependencies</CardTitle>
            <Switch checked={hasDependency} onCheckedChange={handleDependencyChange} />
          </div>
        </CardHeader>
        {hasDependency && (
          <CardContent className="pt-0 space-y-3">
            <div>
              <Label>Depends on Variable</Label>
              <Select
                value={constraint.dependsOnValue?.variableId || ""}
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
                value={constraint.dependsOnValue?.relationship || "less_equal"}
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

            {constraint.dependsOnValue?.relationship === "custom" ? (
              <div>
                <Label>Custom Formula</Label>
                <Input
                  placeholder="e.g., n/2 + 1, n*2-1, min(n, 50)"
                  value={constraint.dependsOnValue?.customFormula || ""}
                  onChange={(e) => handleDependencyUpdate("customFormula", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use variable names in your formula. Example: n/2 + 1
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="1"
                    value={constraint.dependsOnValue?.multiplier || ""}
                    onChange={(e) => handleDependencyUpdate("multiplier", e.target.value ? Number(e.target.value) : 1)}
                  />
                </div>
                <div>
                  <Label>Offset</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={constraint.dependsOnValue?.offset || ""}
                    onChange={(e) => handleDependencyUpdate("offset", e.target.value ? Number(e.target.value) : 0)}
                  />
                </div>
              </div>
            )}

            {constraint.dependsOnValue?.variableId && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Constraint:</strong> This variable will be {getRelationshipDescription()}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      {/* Dynamic Range Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            {hasDependency ? "Additional Range Constraints" : "Range Constraints"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {rangeConstraints.note && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{rangeConstraints.note}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={rangeConstraints.minDisabled ? "text-muted-foreground" : ""}>Min Value</Label>
              <Input
                type="number"
                placeholder={rangeConstraints.minDisabled ? "Auto" : "e.g., 1"}
                value={rangeConstraints.minDisabled ? "" : constraint.min || ""}
                onChange={(e) => updateConstraint({ min: e.target.value ? Number(e.target.value) : undefined })}
                disabled={rangeConstraints.minDisabled}
              />
              {rangeConstraints.minNote && (
                <p className="text-xs text-muted-foreground mt-1">{rangeConstraints.minNote}</p>
              )}
            </div>
            <div>
              <Label className={rangeConstraints.maxDisabled ? "text-muted-foreground" : ""}>Max Value</Label>
              <Input
                type="number"
                placeholder={rangeConstraints.maxDisabled ? "Auto" : "e.g., 1000"}
                value={rangeConstraints.maxDisabled ? "" : constraint.max || ""}
                onChange={(e) => updateConstraint({ max: e.target.value ? Number(e.target.value) : undefined })}
                disabled={rangeConstraints.maxDisabled}
              />
              {rangeConstraints.maxNote && (
                <p className="text-xs text-muted-foreground mt-1">{rangeConstraints.maxNote}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Logic */}
      <div>
        <Label>Custom Logic (optional)</Label>
        <Input
          placeholder="e.g., n % 3 == 0, x != y"
          value={constraint.customLogic || ""}
          onChange={(e) => updateConstraint({ customLogic: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-1">Additional constraints beyond the dependency rules</p>
      </div>
    </div>
  )
}
