import type { Variable, GraphConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

interface Edge {
  from: number
  to: number
  weight?: number
}

export function generateGraphValue(variable: Variable, existingValues: Record<string, any>): any {
  const constraint = variable.constraint as GraphConstraint

  if (!constraint) {
    GenerationLogger.warn(`No constraint found for graph ${variable.name}, using defaults`)
    return generateDefaultGraph()
  }

  // Determine node count
  let nodeCount: number
  if (constraint.nodeCountType === "linked" && constraint.linkedNodeVariable) {
    const linkedVarId = constraint.linkedNodeVariable
    nodeCount = existingValues[linkedVarId] || 5
    GenerationLogger.debug(`🔗 Graph node count linked to variable: ${nodeCount}`)
  } else {
    const min = constraint.minNodes ?? 3
    const max = constraint.maxNodes ?? 8
    nodeCount = Math.floor(Math.random() * (max - min + 1)) + min
    GenerationLogger.debug(`🎲 Random graph node count: ${nodeCount} (range: ${min}-${max})`)
  }

  // Determine edge count
  let edgeCount: number
  if (constraint.edgeCountType === "linked" && constraint.linkedEdgeVariable) {
    const linkedVarId = constraint.linkedEdgeVariable
    edgeCount = existingValues[linkedVarId] || Math.floor(nodeCount * 1.5)
    GenerationLogger.debug(`🔗 Graph edge count linked to variable: ${edgeCount}`)
  } else {
    const minEdges = constraint.minEdges ?? Math.max(1, nodeCount - 1)
    const maxEdges = constraint.maxEdges ?? Math.floor((nodeCount * (nodeCount - 1)) / (constraint.directed ? 1 : 2))
    edgeCount = Math.floor(Math.random() * (maxEdges - minEdges + 1)) + minEdges
    GenerationLogger.debug(`🎲 Random graph edge count: ${edgeCount} (range: ${minEdges}-${maxEdges})`)
  }

  GenerationLogger.debug(
    `🕸️ Generating ${constraint.graphType || "simple"} graph with ${nodeCount} nodes, ${edgeCount} edges`,
  )
  GenerationLogger.debug(`📊 Directed: ${constraint.directed}, Weighted: ${constraint.weighted}`)

  // Generate graph based on type
  switch (constraint.graphType) {
    case "complete":
      return generateCompleteGraph(nodeCount, constraint)
    case "bipartite":
      return generateBipartiteGraph(nodeCount, edgeCount, constraint)
    case "dag":
      return generateDAG(nodeCount, edgeCount, constraint)
    case "tree":
      return generateTreeGraph(nodeCount, constraint)
    default:
      return generateSimpleGraph(nodeCount, edgeCount, constraint)
  }
}

function generateSimpleGraph(nodeCount: number, edgeCount: number, constraint: GraphConstraint): any {
  const edges: Edge[] = []
  const edgeSet = new Set<string>()

  // Ensure connectivity if required
  if (constraint.connected) {
    // Create spanning tree first
    for (let i = 1; i < nodeCount; i++) {
      const from = Math.floor(Math.random() * i)
      const to = i
      const edgeKey = constraint.directed ? `${from}-${to}` : `${Math.min(from, to)}-${Math.max(from, to)}`

      edges.push(createEdge(from, to, constraint))
      edgeSet.add(edgeKey)
    }
  }

  // Add remaining edges randomly
  while (edges.length < edgeCount) {
    const from = Math.floor(Math.random() * nodeCount)
    const to = Math.floor(Math.random() * nodeCount)

    if (from === to) continue // No self loops

    const edgeKey = constraint.directed ? `${from}-${to}` : `${Math.min(from, to)}-${Math.max(from, to)}`

    if (!edgeSet.has(edgeKey)) {
      edges.push(createEdge(from, to, constraint))
      edgeSet.add(edgeKey)
    }
  }

  return formatGraphOutput(nodeCount, edges, constraint.outputFormat || "edge_list")
}

function generateCompleteGraph(nodeCount: number, constraint: GraphConstraint): any {
  const edges: Edge[] = []

  for (let i = 0; i < nodeCount; i++) {
    for (let j = constraint.directed ? 0 : i + 1; j < nodeCount; j++) {
      if (i !== j) {
        edges.push(createEdge(i, j, constraint))
      }
    }
  }

  return formatGraphOutput(nodeCount, edges, constraint.outputFormat || "edge_list")
}

function generateBipartiteGraph(nodeCount: number, edgeCount: number, constraint: GraphConstraint): any {
  const set1Size = Math.floor(nodeCount / 2)
  const set2Size = nodeCount - set1Size
  const edges: Edge[] = []
  const edgeSet = new Set<string>()

  // Generate edges only between the two sets
  while (edges.length < edgeCount) {
    const from = Math.floor(Math.random() * set1Size)
    const to = set1Size + Math.floor(Math.random() * set2Size)

    const edgeKey = constraint.directed ? `${from}-${to}` : `${Math.min(from, to)}-${Math.max(from, to)}`

    if (!edgeSet.has(edgeKey)) {
      edges.push(createEdge(from, to, constraint))
      edgeSet.add(edgeKey)
    }
  }

  return formatGraphOutput(nodeCount, edges, constraint.outputFormat || "edge_list")
}

function generateDAG(nodeCount: number, edgeCount: number, constraint: GraphConstraint): any {
  const edges: Edge[] = []
  const edgeSet = new Set<string>()

  // Generate edges only from lower to higher numbered nodes (ensures acyclic)
  while (edges.length < edgeCount) {
    const from = Math.floor(Math.random() * (nodeCount - 1))
    const to = from + 1 + Math.floor(Math.random() * (nodeCount - from - 1))

    const edgeKey = `${from}-${to}`

    if (!edgeSet.has(edgeKey)) {
      edges.push(createEdge(from, to, constraint))
      edgeSet.add(edgeKey)
    }
  }

  return formatGraphOutput(nodeCount, edges, constraint.outputFormat || "edge_list")
}

function generateTreeGraph(nodeCount: number, constraint: GraphConstraint): any {
  const edges: Edge[] = []

  // Generate spanning tree
  for (let i = 1; i < nodeCount; i++) {
    const parent = Math.floor(Math.random() * i)
    edges.push(createEdge(parent, i, constraint))
  }

  return formatGraphOutput(nodeCount, edges, constraint.outputFormat || "edge_list")
}

function createEdge(from: number, to: number, constraint: GraphConstraint): Edge {
  const edge: Edge = { from, to }

  if (constraint.weighted) {
    const minWeight = constraint.minWeight ?? 1
    const maxWeight = constraint.maxWeight ?? 100
    edge.weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight
  }

  return edge
}

function formatGraphOutput(nodeCount: number, edges: Edge[], format: string): any {
  switch (format) {
    case "adjacency_list":
      return graphToAdjacencyList(nodeCount, edges)
    case "adjacency_matrix":
      return graphToAdjacencyMatrix(nodeCount, edges)
    case "edge_list":
      return graphToEdgeList(edges)
    default:
      return graphToEdgeList(edges)
  }
}

function graphToAdjacencyList(nodeCount: number, edges: Edge[]): number[][] {
  const adjList: number[][] = Array.from({ length: nodeCount }, () => [])

  edges.forEach((edge) => {
    adjList[edge.from].push(edge.to)
  })

  return adjList
}

function graphToAdjacencyMatrix(nodeCount: number, edges: Edge[]): number[][] {
  const matrix: number[][] = Array.from({ length: nodeCount }, () => Array.from({ length: nodeCount }, () => 0))

  edges.forEach((edge) => {
    matrix[edge.from][edge.to] = edge.weight ?? 1
  })

  return matrix
}

function graphToEdgeList(edges: Edge[]): number[][] {
  return edges.map((edge) => (edge.weight !== undefined ? [edge.from, edge.to, edge.weight] : [edge.from, edge.to]))
}

function generateDefaultGraph(): number[][] {
  GenerationLogger.debug("🕸️ Generating default simple graph")
  return [
    [0, 1],
    [1, 2],
    [2, 0],
  ] // Simple triangle
}
