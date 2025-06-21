"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { VariableBuilder } from "@/components/variables/variable-builder"
import { DependencyGraph } from "@/components/graph/dependency-graph"
import { GenerationControls } from "@/components/generation/generation-controls"
import { OutputFormatBuilder } from "@/components/output/output-format-builder"
import { Header } from "@/components/layout/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Variable, OutputFormat } from "@/types/variables"

export default function TestcaseGenerator() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [variables, setVariables] = useState<Variable[]>([])
  const [outputFormat, setOutputFormat] = useState<OutputFormat>({
    id: "default",
    name: "Default Format",
    structure: [],
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const addVariable = (variable: Variable) => {
    setVariables((prev) => [...prev, variable])
  }

  const updateVariable = (id: string, updates: Partial<Variable>) => {
    setVariables((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)))
  }

  const removeVariable = (id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="container mx-auto p-4 max-w-7xl">
        <Tabs defaultValue="variables" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="output">Output Format</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <VariableBuilder
                variables={variables}
                onAddVariable={addVariable}
                onUpdateVariable={updateVariable}
                onRemoveVariable={removeVariable}
              />
            </div>
          </TabsContent>

          <TabsContent value="dependencies" className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden h-[600px]">
              <DependencyGraph variables={variables} />
            </div>
          </TabsContent>

          <TabsContent value="output" className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <OutputFormatBuilder variables={variables} outputFormat={outputFormat} onUpdateFormat={setOutputFormat} />
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <GenerationControls variables={variables} outputFormat={outputFormat} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
