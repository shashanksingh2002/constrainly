"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { MatrixConstraint, Variable, VariableConstraint } from "@/types/variables"

interface MatrixConstraintsProps {
  constraint: MatrixConstraint
  availableVariables: Variable[]
  updateConstraint: (updates: Partial<VariableConstraint>) => void
  updateDependencies: (deps: string[]) => void
}

export function MatrixConstraints({
  constraint,
  availableVariables,
  updateConstraint,
  updateDependencies,
}: MatrixConstraintsProps) {
  const updateDeps = () => {
    const deps: string[] = []
    if (constraint.rowsType === "linked" && constraint.linkedRowVariable) {
      deps.push(constraint.linkedRowVariable)
    }
    if (constraint.colsType === "linked" && constraint.linkedColVariable) {
      deps.push(constraint.linkedColVariable)
    }
    updateDependencies(deps)
  }

  return (
    <div className="space-y-6">
      {/* Matrix Type */}
      <div>
        <Label className="text-sm font-medium">Matrix Type</Label>
        <Select
          value={constraint.matrixType || "rectangular"}
          onValueChange={(value: "rectangular" | "square" | "triangular" | "diagonal" | "sparse") =>
            updateConstraint({ matrixType: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rectangular">Rectangular Matrix</SelectItem>
            <SelectItem value="square">Square Matrix</SelectItem>
            <SelectItem value="triangular">Triangular Matrix</SelectItem>
            <SelectItem value="diagonal">Diagonal Matrix</SelectItem>
            <SelectItem value="sparse">Sparse Matrix</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rows Configuration */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Rows Configuration</Label>
        <Select
          value={constraint.rowsType}
          onValueChange={(value: "manual" | "linked") => {
            updateConstraint({ rowsType: value })
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

        {constraint.rowsType === "manual" ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Rows</Label>
              <Input
                type="number"
                min="1"
                value={constraint.minRows || ""}
                onChange={(e) => updateConstraint({ minRows: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label>Max Rows</Label>
              <Input
                type="number"
                min="1"
                value={constraint.maxRows || ""}
                onChange={(e) => updateConstraint({ maxRows: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
        ) : (
          <div>
            <Label>Linked Variable</Label>
            <Select
              value={constraint.linkedRowVariable || ""}
              onValueChange={(value) => {
                updateConstraint({ linkedRowVariable: value })
                updateDeps()
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variable for rows" />
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

      {/* Columns Configuration (only for non-square matrices) */}
      {constraint.matrixType !== "square" && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Columns Configuration</Label>
          <Select
            value={constraint.colsType}
            onValueChange={(value: "manual" | "linked") => {
              updateConstraint({ colsType: value })
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

          {constraint.colsType === "manual" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Columns</Label>
                <Input
                  type="number"
                  min="1"
                  value={constraint.minCols || ""}
                  onChange={(e) => updateConstraint({ minCols: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div>
                <Label>Max Columns</Label>
                <Input
                  type="number"
                  min="1"
                  value={constraint.maxCols || ""}
                  onChange={(e) => updateConstraint({ maxCols: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          ) : (
            <div>
              <Label>Linked Variable</Label>
              <Select
                value={constraint.linkedColVariable || ""}
                onValueChange={(value) => {
                  updateConstraint({ linkedColVariable: value })
                  updateDeps()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variable for columns" />
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
      )}

      {/* Cell Value Constraints */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Cell Value Constraints</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Value</Label>
            <Input
              type="number"
              value={constraint.cellMin || ""}
              onChange={(e) => updateConstraint({ cellMin: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Max Value</Label>
            <Input
              type="number"
              value={constraint.cellMax || ""}
              onChange={(e) => updateConstraint({ cellMax: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      {/* Matrix Properties */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Matrix Properties</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="symmetric"
              checked={constraint.symmetric || false}
              onCheckedChange={(checked) => updateConstraint({ symmetric: !!checked })}
            />
            <Label htmlFor="symmetric">Symmetric</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="positive-definite"
              checked={constraint.positiveDefinite || false}
              onCheckedChange={(checked) => updateConstraint({ positiveDefinite: !!checked })}
            />
            <Label htmlFor="positive-definite">Positive Definite</Label>
          </div>
        </div>
      </div>

      {/* Custom Rules */}
      <div>
        <Label htmlFor="cell-rules">Custom Cell Rules (Optional)</Label>
        <Textarea
          id="cell-rules"
          placeholder="e.g., matrix[i][j] = i + j, or custom validation logic"
          value={constraint.cellRules || ""}
          onChange={(e) => updateConstraint({ cellRules: e.target.value })}
          className="mt-1"
        />
      </div>
    </div>
  )
}
