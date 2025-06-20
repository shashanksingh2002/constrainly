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

  const initializeNodes = useCallback(() => {
    if (variables.length === 0) {
      setNodes([])
      setEdges([])
      return
    }

    const width = 600
    const height = 400
    const centerX = width / 2
    const centerY = height / 2

    const independentVars = variables.filter((v) => v.dependencies.length === 0)
    const dependentVars = variables.filter((v) => v.dependencies.length > 0)

    const newNodes: GraphNodeData[] = []

    // Position independent variables
    independentVars.forEach((variable, index) => {
      const angle = (index / Math.max(independentVars.length - 1, 1)) * Math.PI - Math.PI / 2
      const radius = Math.min(80, independentVars.length * 15)
      newNodes.push({
        id: variable.id,
        x: centerX - 150 + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        variable,
        isDragging: false,
      })
    })

    // Position dependent variables by dependency level
    const dependencyLevels: Variable[][] = []
    const processed = new Set<string>()

    while (processed.size < dependentVars.length) {
      const currentLevel: Variable[] = []

      for (const variable of dependentVars) {
        if (processed.has(variable.id)) continue

        const allDepsProcessed = variable.dependencies.every(
          (depId) => independentVars.some((v) => v.id === depId) || processed.has(depId),
        )

        if (allDepsProcessed) {
          currentLevel.push(variable)
          processed.add(variable.id)
        }
      }

      if (currentLevel.length > 0) {
        dependencyLevels.push(currentLevel)
      } else {
        dependentVars.forEach((v) => {
          if (!processed.has(v.id)) {
            currentLevel.push(v)
            processed.add(v.id)
          }
        })
        if (currentLevel.length > 0) {
          dependencyLevels.push(currentLevel)
        }
        break
      }
    }

    dependencyLevels.forEach((level, levelIndex) => {
      level.forEach((variable, varIndex) => {
        const x = centerX + 80 + levelIndex * 120
        const y = centerY - (level.length - 1) * 25 + varIndex * 50

        newNodes.push({
          id: variable.id,
          x,
          y,
          variable,
          isDragging: false,
        })
      })
    })

    setNodes(newNodes)

    // Create edges
    const newEdges: GraphEdgeData[] = []
    newNodes.forEach((node) => {
      node.variable.dependencies.forEach((depId) => {
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
  }, [variables])

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
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Interactive Dependency Graph</h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Drag nodes to rearrange • Zoom and pan to explore</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          viewBox="0 0 800 500"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            </pattern>
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
