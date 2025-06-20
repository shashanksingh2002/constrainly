"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { VariableBuilder } from "@/components/variables/variable-builder"
import { DependencyGraph } from "@/components/graph/dependency-graph"
import { GenerationControls } from "@/components/generation/generation-controls"
import { Header } from "@/components/layout/header"
import type { Variable } from "@/types/variables"

export default function TestcaseGenerator() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [variables, setVariables] = useState<Variable[]>([])

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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <VariableBuilder
              variables={variables}
              onAddVariable={addVariable}
              onUpdateVariable={updateVariable}
              onRemoveVariable={removeVariable}
            />
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <DependencyGraph variables={variables} />
          </div>
        </div>

        <div className="mt-6">
          <GenerationControls variables={variables} />
        </div>
      </main>
    </div>
  )
}
