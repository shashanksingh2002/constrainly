"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus, AlertCircle } from "lucide-react"
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
    if (line.variableIds.length === 0) return "⚠️ No variables selected"

    const varNames = line.variableIds.map((id) => {
      const variable = variables.find((v) => v.id === id)
      return variable?.name || `Unknown(${id})`
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

  const handleQuickSetup = () => {
    if (variables.length === 0) return

    // Create a simple format with all variables on one line
    const newLine: OutputLine = {
      id: crypto.randomUUID(),
      type: "space_separated",
      variableIds: variables.map((v) => v.id),
      customSeparator: " ",
      description: "All variables on one line",
    }

    onUpdateFormat({
      ...outputFormat,
      structure: [newLine],
    })
  }

  const hasEmptyLines = outputFormat.structure.some((line) => line.variableIds.length === 0)
  const hasNoLines = outputFormat.structure.length === 0

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
        {/* Quick Setup */}
        {variables.length > 0 && (hasNoLines || hasEmptyLines) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Need help getting started? Try the quick setup.</span>
              <Button variant="outline" size="sm" onClick={handleQuickSetup}>
                Quick Setup
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Warning for empty lines */}
        {hasEmptyLines && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some lines have no variables selected. These lines will be skipped during generation.
            </AlertDescription>
          </Alert>
        )}

        {/* No variables warning */}
        {variables.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No variables defined yet. Please add some variables first in the Variables tab.
            </AlertDescription>
          </Alert>
        )}

        {outputFormat.structure.map((line, idx) => (
          <div key={line.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Line {idx + 1}
                {line.variableIds.length === 0 && <span className="text-red-500 ml-2">(Empty)</span>}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveLine(line.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Variable Selection - Make this more prominent */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-600">📝 Select Variables for this line *</label>
              <div className="flex flex-wrap gap-2 p-3 border-2 border-dashed border-blue-200 rounded-lg min-h-[60px]">
                {variables.length > 0 ? (
                  variables.map((variable) => (
                    <Badge
                      key={variable.id}
                      variant={line.variableIds.includes(variable.id) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleVariableToggle(line.id, variable.id)}
                    >
                      {variable.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No variables available</p>
                )}
              </div>
              {line.variableIds.length === 0 && variables.length > 0 && (
                <p className="text-sm text-red-600">⚠️ Click on variable names above to add them to this line</p>
              )}
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
                  <SelectItem value="space_separated">Space separated (e.g., "n m")</SelectItem>
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

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div
                className={`p-2 rounded text-sm font-mono ${
                  line.variableIds.length === 0 ? "bg-red-50 text-red-700 border border-red-200" : "bg-muted"
                }`}
              >
                {getPreview(line)}
              </div>
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
            <div className="bg-muted p-3 rounded text-sm font-mono whitespace-pre-line border">
              {outputFormat.structure.map((line, idx) => (
                <div key={line.id} className={line.variableIds.length === 0 ? "text-red-500" : ""}>
                  {getPreview(line)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
