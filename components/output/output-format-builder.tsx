"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus } from "lucide-react"
import type { Variable, OutputFormat } from "@/types/variables"

interface OutputFormatBuilderProps {
  variables: Variable[]
  outputFormat: OutputFormat
  onUpdateFormat: (format: OutputFormat) => void
}

export function OutputFormatBuilder({ variables, outputFormat, onUpdateFormat }: OutputFormatBuilderProps) {
  const newLine = () => ({
    id: crypto.randomUUID(),
    content: "",
  })

  const handleAddLine = () => {
    onUpdateFormat({
      ...outputFormat,
      structure: [...outputFormat.structure, newLine()],
    })
  }

  const handleRemoveLine = (id: string) => {
    onUpdateFormat({
      ...outputFormat,
      structure: outputFormat.structure.filter((l) => l.id !== id),
    })
  }

  const handleChange = (id: string, content: string) => {
    onUpdateFormat({
      ...outputFormat,
      structure: outputFormat.structure.map((l) => (l.id === id ? { ...l, content } : l)),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Output Format Builder</CardTitle>
        <p className="text-sm text-muted-foreground">
          Define each line of your testcase output. You can reference variables by name (e.g. <code>{`n k`}</code> or{" "}
          <code>{`arr`}</code>).
        </p>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4">
        {outputFormat.structure.map((line, idx) => (
          <div key={line.id} className="flex gap-2 items-start">
            <span className="text-muted-foreground w-6 shrink-0">{idx + 1}.</span>
            <Input
              value={line.content}
              onChange={(e) => handleChange(line.id, e.target.value)}
              placeholder="Enter line template, e.g. `n k` or `n, m`"
              className="flex-1"
            />
            <Button variant="ghost" size="icon" aria-label="Remove line" onClick={() => handleRemoveLine(line.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={handleAddLine} className="mt-2">
          <Plus className="w-4 h-4 mr-2" /> Add line
        </Button>
      </CardContent>
    </Card>
  )
}
