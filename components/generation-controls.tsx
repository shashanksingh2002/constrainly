"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, Download, Link, Sparkles, AlertCircle } from "lucide-react"
import type { Variable } from "@/types/variable"
import { useToast } from "@/hooks/use-toast"

interface GenerationControlsProps {
  variables: Variable[]
}

export function GenerationControls({ variables }: GenerationControlsProps) {
  const [testcaseCount, setTestcaseCount] = useState(10)
  const [outputFormat, setOutputFormat] = useState<"txt" | "json" | "csv">("txt")
  const [isGenerating, setIsGenerating] = useState(false)
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

    setIsGenerating(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Testcases generated successfully!",
        description: `Generated ${testcaseCount} testcases in ${outputFormat.toUpperCase()} format.`,
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

  const validateConstraints = () => {
    const issues = []

    variables.forEach((variable) => {
      if (variable.constraint.type === "scalar") {
        const constraint = variable.constraint
        if (constraint.min !== undefined && constraint.max !== undefined && constraint.min > constraint.max) {
          issues.push(`${variable.name}: Min value is greater than max value`)
        }
      }

      if (variable.dependencies.length > 0) {
        variable.dependencies.forEach((depId) => {
          const depVar = variables.find((v) => v.id === depId)
          if (!depVar) {
            issues.push(`${variable.name}: References unknown variable`)
          }
        })
      }
    })

    return issues
  }

  const validationIssues = validateConstraints()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Generate Testcases</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Configure generation parameters and output format</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {variables.length} variable{variables.length !== 1 ? "s" : ""} defined
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 space-y-4">
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
                <Label htmlFor="output-format">Output Format</Label>
                <Select value={outputFormat} onValueChange={(value: "txt" | "json" | "csv") => setOutputFormat(value)}>
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

            <Button onClick={handleGenerate} disabled={isGenerating || variables.length === 0} className="w-full">
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

            {validationIssues.length > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Validation Issues
                </div>
                <ul className="text-xs text-destructive space-y-1">
                  {validationIssues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="hidden lg:block" />

          <div className="space-y-4 opacity-60">
            <div>
              <Label className="text-muted-foreground">V2 Features (Coming Soon)</Label>
            </div>

            <div className="space-y-3">
              <div className="p-3 border border-dashed border-muted-foreground/30 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="w-4 h-4" />
                  <span className="text-sm font-medium">Problem Link Integration</span>
                </div>
                <Input placeholder="Paste Leetcode/Codeforces URL..." disabled className="text-xs" />
              </div>

              <div className="p-3 border border-dashed border-muted-foreground/30 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">AI-Powered Generation</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Random: 5" disabled className="text-xs" />
                  <Input placeholder="AI Edge: 3" disabled className="text-xs" />
                </div>
              </div>

              <Button disabled className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Smart Generate (V2)
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
