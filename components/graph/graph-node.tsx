"use client"

import type React from "react"
import type { Variable } from "@/types/variables"
import { VARIABLE_TYPE_COLORS } from "@/lib/constants/variable-types"

interface GraphNodeProps {
  node: {
    id: string
    x: number
    y: number
    variable: Variable
    isDragging: boolean
  }
  isSelected: boolean
  constraintSummary: string
  onMouseDown: (e: React.MouseEvent) => void
}

export function GraphNode({ node, isSelected, constraintSummary, onMouseDown }: GraphNodeProps) {
  const colors = VARIABLE_TYPE_COLORS[node.variable.type]

  return (
    <g transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer" onMouseDown={onMouseDown}>
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
        {constraintSummary}
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
}
