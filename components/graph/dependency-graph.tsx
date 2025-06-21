"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import type { Variable } from "@/types/variables"
import { getConstraintSummary } from "@/lib/utils/constraint-summary"
import { GraphNode } from "./graph-node"
import { GraphEdge } from "./graph-edge"
import { GraphLegend } from "./graph-legend"
import { EmptyGraphState } from "./empty-graph-state"

interface DependencyGraphProps {
  variables: Variable[]
}

interface GraphNodeData {
  id: string
  x: number
  y: number
  variable: Variable
  isDragging: boolean
}

interface GraphEdgeData {
  from: string
  to: string
  fromNode: GraphNodeData
  toNode: GraphNodeData
}

export function DependencyGraph({ variables }: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<GraphNodeData[]>([])
  const [edges, setEdges] = useState<GraphEdgeData[]>([])
  const [zoom, setZoom] = useState(1)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Enhanced dependency extraction that handles all constraint types
  const extractDependencies = useCallback((variable: Variable): string[] => {
    const deps: string[] = []
    const constraint = variable.constraint

    switch (constraint.type) {
      case "array":
        if (constraint.sizeType === "linked" && constraint.linkedVariable) {
          deps.push(constraint.linkedVariable)
        }
        break

      case "matrix":
        if (constraint.rowsType === "linked" && constraint.linkedRowVariable) {
          deps.push(constraint.linkedRowVariable)
        }
        if (constraint.colsType === "linked" && constraint.linkedColVariable) {
          deps.push(constraint.linkedColVariable)
        }
        break

      case "string":
        if (constraint.lengthType === "linked" && constraint.linkedVariable) {
          deps.push(constraint.linkedVariable)
        }
        break

      case "tree":
        if (constraint.nodeCountType === "linked" && constraint.linkedVariable) {
          deps.push(constraint.linkedVariable)
        }
        break

      case "graph":
        if (constraint.nodesType === "linked" && constraint.linkedNodeVariable) {
          deps.push(constraint.linkedNodeVariable)
        }
        if (constraint.edgesType === "linked" && constraint.linkedEdgeVariable) {
          deps.push(constraint.linkedEdgeVariable)
        }
        break
    }

    // Also include any explicitly set dependencies
    if (variable.dependencies) {
      deps.push(...variable.dependencies)
    }

    // Remove duplicates and return
    return [...new Set(deps)]
  }, [])

  const initializeNodes = useCallback(() => {
    if (variables.length === 0) {
      setNodes([])
      setEdges([])
      return
    }

    const width = 800
    const height = 500
    const centerX = width / 2
    const centerY = height / 2

    // Extract actual dependencies for each variable
    const variablesWithDeps = variables.map((variable) => ({
      ...variable,
      actualDependencies: extractDependencies(variable),
    }))

    const independentVars = variablesWithDeps.filter((v) => v.actualDependencies.length === 0)
    const dependentVars = variablesWithDeps.filter((v) => v.actualDependencies.length > 0)

    const newNodes: GraphNodeData[] = []

    // Position independent variables in a semi-circle on the left
    independentVars.forEach((variable, index) => {
      const angle = independentVars.length === 1 ? 0 : (index / (independentVars.length - 1)) * Math.PI - Math.PI / 2
      const radius = Math.min(100, independentVars.length * 20)

      newNodes.push({
        id: variable.id,
        x: centerX - 200 + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        variable: variable,
        isDragging: false,
      })
    })

    // Position dependent variables by dependency level using topological sorting
    const dependencyLevels: (typeof variablesWithDeps)[][] = []
    const processed = new Set<string>()
    const processing = new Set<string>()

    // Add independent variables to processed
    independentVars.forEach((v) => processed.add(v.id))

    const canProcess = (variable: (typeof variablesWithDeps)[0]) => {
      return variable.actualDependencies.every((depId) => processed.has(depId))
    }

    // Build dependency levels
    while (processed.size < variables.length) {
      const currentLevel: (typeof variablesWithDeps)[] = []

      for (const variable of dependentVars) {
        if (processed.has(variable.id) || processing.has(variable.id)) continue

        if (canProcess(variable)) {
          currentLevel.push(variable)
          processing.add(variable.id)
        }
      }

      if (currentLevel.length === 0) {
        // Handle circular dependencies or remaining variables
        const remaining = dependentVars.filter((v) => !processed.has(v.id) && !processing.has(v.id))
        if (remaining.length > 0) {
          currentLevel.push(...remaining)
          remaining.forEach((v) => processing.add(v.id))
        } else {
          break
        }
      }

      if (currentLevel.length > 0) {
        dependencyLevels.push(currentLevel)
        currentLevel.forEach((v) => {
          processed.add(v.id)
          processing.delete(v.id)
        })
      }
    }

    // Position dependent variables by level
    dependencyLevels.forEach((level, levelIndex) => {
      const levelX = centerX - 50 + (levelIndex + 1) * 150
      const startY = centerY - (level.length - 1) * 30

      level.forEach((variable, varIndex) => {
        const y = startY + varIndex * 60

        newNodes.push({
          id: variable.id,
          x: levelX,
          y: y,
          variable: variable,
          isDragging: false,
        })
      })
    })

    setNodes(newNodes)

    // Create edges based on actual dependencies
    const newEdges: GraphEdgeData[] = []
    newNodes.forEach((node) => {
      const actualDeps = extractDependencies(node.variable)
      actualDeps.forEach((depId) => {
        const fromNode = newNodes.find((n) => n.id === depId)
        if (fromNode) {
          newEdges.push({
            from: depId,
            to: node.id,
            fromNode,
            toNode: node,
          })
        }
      })
    })

    setEdges(newEdges)
  }, [variables, extractDependencies])

  useEffect(() => {
    initializeNodes()
  }, [initializeNodes])

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault()
    setSelectedNode(nodeId)
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })

    setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, isDragging: true } : node)))
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !selectedNode) return

      const deltaX = (e.clientX - dragStart.x) / zoom
      const deltaY = (e.clientY - dragStart.y) / zoom

      setNodes((prev) =>
        prev.map((node) => (node.id === selectedNode ? { ...node, x: node.x + deltaX, y: node.y + deltaY } : node)),
      )

      setDragStart({ x: e.clientX, y: e.clientY })
    },
    [isDragging, selectedNode, dragStart, zoom],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setSelectedNode(null)
    setNodes((prev) => prev.map((node) => ({ ...node, isDragging: false })))
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.3))
  const handleReset = () => {
    setZoom(1)
    initializeNodes()
  }

  // Update edges when nodes move
  useEffect(() => {
    setEdges((prev) =>
      prev
        .map((edge) => ({
          ...edge,
          fromNode: nodes.find((n) => n.id === edge.from)!,
          toNode: nodes.find((n) => n.id === edge.to)!,
        }))
        .filter((edge) => edge.fromNode && edge.toNode),
    )
  }, [nodes])

  if (variables.length === 0) {
    return <EmptyGraphState />
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold">Dependency Graph</h2>
            <p className="text-sm text-muted-foreground">
              {variables.length} variables • {edges.length} dependencies
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset} title="Reset View">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          viewBox="0 0 800 500"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.5" />
            </pattern>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.1" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g>
            {edges.map((edge) => (
              <GraphEdge key={`${edge.from}-${edge.to}`} edge={edge} />
            ))}
          </g>

          <g>
            {nodes.map((node) => (
              <GraphNode
                key={node.id}
                node={node}
                isSelected={selectedNode === node.id}
                constraintSummary={getConstraintSummary(node.variable, variables)}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              />
            ))}
          </g>
        </svg>
      </div>

      <GraphLegend variables={variables} />
    </div>
  )
}
