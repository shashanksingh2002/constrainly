"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import type { Variable } from "@/types/variable"
import { Hash, Type, List, Grid, TreePine, Network } from "lucide-react"

interface DependencyGraphProps {
  variables: Variable[]
}

interface GraphNode {
  id: string
  x: number
  y: number
  variable: Variable
  isDragging: boolean
}

interface GraphEdge {
  from: string
  to: string
  fromNode: GraphNode
  toNode: GraphNode
}

const typeIcons = {
  int: Hash,
  float: Hash,
  double: Hash,
  string: Type,
  array: List,
  matrix: Grid,
  tree: TreePine,
  graph: Network,
}

const typeColors = {
  int: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  float: { bg: "#dcfce7", border: "#22c55e", text: "#15803d" },
  double: { bg: "#f3e8ff", border: "#a855f7", text: "#7c3aed" },
  string: { bg: "#fef3c7", border: "#f59e0b", text: "#d97706" },
  array: { bg: "#fed7aa", border: "#ea580c", text: "#c2410c" },
  matrix: { bg: "#fecaca", border: "#ef4444", text: "#dc2626" },
  tree: { bg: "#d1fae5", border: "#10b981", text: "#059669" },
  graph: { bg: "#e0e7ff", border: "#6366f1", text: "#4f46e5" },
}

export function DependencyGraph({ variables }: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
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

    const newNodes: GraphNode[] = []

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

    // Position dependent variables
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
    const newEdges: GraphEdge[] = []
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

  const getConstraintSummary = (variable: Variable) => {
    const constraint = variable.constraint
    switch (constraint.type) {
      case "scalar":
        const parts = []
        if (constraint.min !== undefined) parts.push(`${constraint.min}`)
        if (constraint.max !== undefined) parts.push(`${constraint.max}`)
        return parts.length > 0 ? `[${parts.join("-")}]` : ""
      case "array":
        if (constraint.sizeType === "linked") {
          const linkedVar = variables.find((v) => v.id === constraint.linkedVariable)
          return linkedVar ? `size: ${linkedVar.name}` : ""
        }
        return constraint.minSize ? `[${constraint.minSize}-${constraint.maxSize || "∞"}]` : ""
      case "string":
        return `${constraint.charSet}`
      case "tree":
        return constraint.treeType
      case "graph":
        return constraint.graphType
      default:
        return ""
    }
  }

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
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-2">Interactive Dependency Graph</h2>
          <p className="text-sm text-muted-foreground">Visual representation of variable relationships</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Network className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No variables to visualize</p>
            <p className="text-sm">Add variables to see their interactive dependency graph</p>
          </div>
        </div>
      </div>
    )
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
            {edges.map((edge) => {
              const dx = edge.toNode.x - edge.fromNode.x
              const dy = edge.toNode.y - edge.fromNode.y
              const length = Math.sqrt(dx * dx + dy * dy)
              const unitX = dx / length
              const unitY = dy / length

              const nodeRadius = 35
              const startX = edge.fromNode.x + unitX * nodeRadius
              const startY = edge.fromNode.y + unitY * nodeRadius
              const endX = edge.toNode.x - unitX * nodeRadius
              const endY = edge.toNode.y - unitY * nodeRadius

              const arrowLength = 8
              const arrowAngle = Math.PI / 6
              const arrowX1 = endX - arrowLength * Math.cos(Math.atan2(dy, dx) - arrowAngle)
              const arrowY1 = endY - arrowLength * Math.sin(Math.atan2(dy, dx) - arrowAngle)
              const arrowX2 = endX - arrowLength * Math.cos(Math.atan2(dy, dx) + arrowAngle)
              const arrowY2 = endY - arrowLength * Math.sin(Math.atan2(dy, dx) + arrowAngle)

              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#64748b" strokeWidth="2" />
                  <polygon points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`} fill="#64748b" />
                </g>
              )
            })}
          </g>

          <g>
            {nodes.map((node) => {
              const colors = typeColors[node.variable.type]
              const isSelected = selectedNode === node.id

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                  <circle cx="1" cy="1" r="37" fill="rgba(0,0,0,0.1)" className="pointer-events-none" />
                  <circle
                    r="35"
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth={isSelected ? "3" : "2"}
                    className="transition-all duration-200"
                  />
                  <text
                    y="-6"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill={colors.text}
                    className="pointer-events-none select-none"
                  >
                    {node.variable.name}
                  </text>
                  <text
                    y="6"
                    textAnchor="middle"
                    fontSize="9"
                    fill={colors.text}
                    opacity="0.8"
                    className="pointer-events-none select-none"
                  >
                    {node.variable.type}
                  </text>
                  <text
                    y="16"
                    textAnchor="middle"
                    fontSize="7"
                    fill={colors.text}
                    opacity="0.6"
                    className="pointer-events-none select-none"
                  >
                    {getConstraintSummary(node.variable)}
                  </text>
                  {node.isDragging && (
                    <circle
                      r="40"
                      fill="none"
                      stroke={colors.border}
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      opacity="0.5"
                      className="pointer-events-none"
                    />
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <div className="p-4 border-t bg-gray-50/50">
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeColors).map(([type, colors]) => {
            const hasVariables = variables.some((v) => v.type === type)
            if (!hasVariables) return null

            const Icon = typeIcons[type as keyof typeof typeIcons]
            return (
              <div key={type} className="flex items-center gap-1 text-xs">
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                />
                <Icon className="w-3 h-3" style={{ color: colors.text }} />
                <span className="capitalize">{type}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
