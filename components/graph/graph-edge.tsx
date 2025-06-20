interface GraphEdgeProps {
  edge: {
    from: string
    to: string
    fromNode: { x: number; y: number }
    toNode: { x: number; y: number }
  }
}

export function GraphEdge({ edge }: GraphEdgeProps) {
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
    <g>
      <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#64748b" strokeWidth="2" />
      <polygon points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`} fill="#64748b" />
    </g>
  )
}
