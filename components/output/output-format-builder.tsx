"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"
import type { Variable, OutputFormat, OutputLine } from "@/types/variables"

interface OutputFormatBuilderProps {
  variables: Variable[]
  outputFormat: OutputFormat
  onUpdateFormat: (format: OutputFormat) => void
}

export function OutputFormatBuilder({ variables, outputFormat, onUpdateFormat }: OutputFormatBuilderProps) {
  const createNewLine = (): OutputLine => ({
    id: crypto.randomUUID(),
    type: "space_separated",
    variableIds: [],
    customSeparator: " ",
    description: "",
  })

  const handleAddLine = () => {
    onUpdateFormat({
      ...outputFormat,
      structure: [...outputFormat.structure, createNewLine()],
    })
  }

  const handleRemoveLine = (id: string) => {
    onUpdateFormat({
      ...outputFormat,
      structure: outputFormat.structure.filter((l) => l.id !== id),
    })
  }

  const handleLineChange = (id: string, updates: Partial<OutputLine>) => {
    onUpdateFormat({
      ...outputFormat,
      structure: outputFormat.structure.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })
  }

  const handleVariableToggle = (lineId: string, variableId: string) => {
    const line = outputFormat.structure.find((l) => l.id === lineId)
    if (!line) return

    const newVariableIds = line.variableIds.includes(variableId)
      ? line.variableIds.filter((id) => id !== variableId)
      : [...line.variableIds, variableId]

    handleLineChange(lineId, { variableIds: newVariableIds })
  }

  const getPreview = (line: OutputLine): string => {
    if (line.variableIds.length === 0) return "No variables selected"

    const varNames = line.variableIds.map((id) => {
      const variable = variables.find((v) => v.id === id)
      return variable?.name || id
    })

    switch (line.type) {
      case "single":
        return varNames[0] || ""
      case "space_separated":
        return varNames.join(" ")
      case "newline_separated":
        return varNames.join("\\n")
      case "custom":
        return varNames.join(line.customSeparator || " ")
      default:
        return varNames.join(" ")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Output Format Builder</CardTitle>
        <p className="text-sm text-muted-foreground">
          Define how your testcase output should be structured. Each line can contain one or more variables.
        </p>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6">
        {outputFormat.structure.map((line, idx) => (
          <div key={line.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Line {idx + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveLine(line.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Line Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Format Type</label>
              <Select value={line.type} onValueChange={(value: any) => handleLineChange(line.id, { type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single variable</SelectItem>
                  <SelectItem value="space_separated">Space separated</SelectItem>
                  <SelectItem value="newline_separated">Each on new line</SelectItem>
                  <SelectItem value="custom">Custom separator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Separator Input */}
            {line.type === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Separator</label>
                <Input
                  value={line.customSeparator || " "}
                  onChange={(e) => handleLineChange(line.id, { customSeparator: e.target.value })}
                  placeholder="Enter separator (e.g., ', ', '\\t', '|')"
                />
              </div>
            )}

            {/* Variable Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Variables</label>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Badge
                    key={variable.id}
                    variant={line.variableIds.includes(variable.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleVariableToggle(line.id, variable.id)}
                  >
                    {variable.name}
                  </Badge>
                ))}
              </div>
              {variables.length === 0 && <p className="text-sm text-muted-foreground">No variables defined yet</p>}
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="bg-muted p-2 rounded text-sm font-mono">{getPreview(line)}</div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={line.description || ""}
                onChange={(e) => handleLineChange(line.id, { description: e.target.value })}
                placeholder="Describe this line (e.g., 'First line contains n and m')"
              />
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={handleAddLine} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Add Output Line
        </Button>

        {/* Overall Preview */}
        {outputFormat.structure.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Complete Output Preview</label>
            <div className="bg-muted p-3 rounded text-sm font-mono whitespace-pre-line">
              {outputFormat.structure.map((line, idx) => (
                <div key={line.id}>{getPreview(line)}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
