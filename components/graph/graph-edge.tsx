interface GraphEdgeProps {
  edge: {
    from: string
    to: string
    fromNode: { x: number; y: number }
    toNode: { x: number; y: number }
  }
}

export function GraphEdge({ edge }: GraphEdgeProps) {
  const { fromNode, toNode } = edge

  // Calculate connection points on the edge of nodes (assuming 40px radius)
  const nodeRadius = 40
  const dx = toNode.x - fromNode.x
  const dy = toNode.y - fromNode.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) return null

  const unitX = dx / distance
  const unitY = dy / distance

  const startX = fromNode.x + unitX * nodeRadius
  const startY = fromNode.y + unitY * nodeRadius
  const endX = toNode.x - unitX * nodeRadius
  const endY = toNode.y - unitY * nodeRadius

  // Create a curved path for better visual appeal
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2

  // Add some curve based on the distance
  const curvature = Math.min(distance * 0.2, 50)
  const controlX = midX + unitY * curvature
  const controlY = midY - unitX * curvature

  const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`

  // Calculate arrow position and angle
  const arrowSize = 8
  const angle = Math.atan2(dy, dx)

  return (
    <g className="edge">
      {/* Edge path with gradient */}
      <defs>
        <linearGradient id={`gradient-${edge.from}-${edge.to}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Shadow/glow effect */}
      <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="3" opacity="0.3" filter="blur(2px)" />

      {/* Main edge */}
      <path
        d={pathData}
        fill="none"
        stroke={`url(#gradient-${edge.from}-${edge.to})`}
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        className="transition-all duration-200 hover:stroke-width-3"
      />

      {/* Arrowhead */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#1d4ed8" className="transition-colors duration-200" />
        </marker>
      </defs>

      {/* Interactive hit area */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="12"
        className="cursor-pointer"
        title={`Dependency: ${edge.from} → ${edge.to}`}
      />
    </g>
  )
}
