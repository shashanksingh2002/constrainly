"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, Download } from "lucide-react"
import type { Variable, OutputFormat } from "@/types/variables"
import { useToast } from "@/hooks/use-toast"
import { validateConstraints } from "@/lib/utils/validation"
import { ValidationIssues } from "./validation-issues"
import { generateTestcases } from "@/actions/generate-testcases"
import { Textarea } from "@/components/ui/textarea"

interface GenerationControlsProps {
  variables: Variable[]
  outputFormat: OutputFormat
}

export function GenerationControls({ variables, outputFormat }: GenerationControlsProps) {
  const [testcaseCount, setTestcaseCount] = useState(10)
  const [outputFormatType, setOutputFormatType] = useState<"txt" | "json" | "csv">("txt")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedOutput, setGeneratedOutput] = useState<string>("")
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (variables.length === 0) {
      toast({
        title: "No variables defined",
        description: "Please add at least one variable before generating testcases.",
        variant: "destructive",
      })
      return
    }

    if (outputFormat.structure.length === 0) {
      toast({
        title: "No output format defined",
        description: "Please define the output format in the Output Format tab.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const generatedCases = await generateTestcases(variables, testcaseCount, outputFormat)
      setGeneratedOutput(generatedCases)

      toast({
        title: "Testcases generated successfully!",
        description: `Generated ${testcaseCount} testcases with your custom format.`,
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "An error occurred while generating testcases.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedOutput) return

    const blob = new Blob([generatedOutput], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `testcases.${outputFormatType}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const validationIssues = validateConstraints(variables)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Generate Testcases</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Configure generation parameters</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {variables.length} variable{variables.length !== 1 ? "s" : ""} defined
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testcase-count">Number of Testcases</Label>
              <Input
                id="testcase-count"
                type="number"
                min="1"
                max="10000"
                value={testcaseCount}
                onChange={(e) => setTestcaseCount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="output-format">Download Format</Label>
              <Select
                value={outputFormatType}
                onValueChange={(value: "txt" | "json" | "csv") => setOutputFormatType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">Text (.txt)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || variables.length === 0 || outputFormat.structure.length === 0}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Testcases
                </>
              )}
            </Button>

            {generatedOutput && (
              <Button onClick={handleDownload} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>

          <ValidationIssues issues={validationIssues} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Output</CardTitle>
          <p className="text-sm text-muted-foreground">Preview of generated testcases</p>
        </CardHeader>
        <CardContent>
          {generatedOutput ? (
            <Textarea
              value={generatedOutput}
              readOnly
              className="min-h-[300px] font-mono text-sm"
              placeholder="Generated testcases will appear here..."
            />
          ) : (
            <div className="min-h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
              Click "Generate Testcases" to see output here
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
