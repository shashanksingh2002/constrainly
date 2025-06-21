import type { Variable, TreeConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

interface TreeNode {
  value: number
  children?: TreeNode[]
  left?: TreeNode
  right?: TreeNode
}

export function generateTreeValue(variable: Variable, existingValues: Record<string, any>): any {
  const constraint = variable.constraint as TreeConstraint

  if (!constraint) {
    GenerationLogger.warn(`No constraint found for tree ${variable.name}, using defaults`)
    return generateDefaultTree()
  }

  // Determine node count
  let nodeCount: number
  if (constraint.nodeCountType === "linked" && constraint.linkedNodeVariable) {
    const linkedVarId = constraint.linkedNodeVariable
    nodeCount = existingValues[linkedVarId] || 5
    GenerationLogger.debug(`🔗 Tree node count linked to variable: ${nodeCount}`)
  } else {
    const min = constraint.minNodes ?? 3
    const max = constraint.maxNodes ?? 10
    nodeCount = Math.floor(Math.random() * (max - min + 1)) + min
    GenerationLogger.debug(`🎲 Random tree node count: ${nodeCount} (range: ${min}-${max})`)
  }

  // Generate node values
  const valueMin = constraint.nodeValueMin ?? 1
  const valueMax = constraint.nodeValueMax ?? 100
  const values = Array.from(
    { length: nodeCount },
    () => Math.floor(Math.random() * (valueMax - valueMin + 1)) + valueMin,
  )

  GenerationLogger.debug(`🌳 Generating ${constraint.treeType || "binary"} tree with ${nodeCount} nodes`)
  GenerationLogger.debug(`📊 Node values range: [${valueMin}, ${valueMax}]`)

  // Generate tree based on type
  switch (constraint.treeType) {
    case "binary":
      return generateBinaryTree(values, constraint)
    case "nary":
      return generateNaryTree(values, constraint)
    case "bst":
      return generateBST(values, constraint)
    default:
      return generateBinaryTree(values, constraint)
  }
}

function generateBinaryTree(values: number[], constraint: TreeConstraint): any {
  if (values.length === 0) return null

  const nodes = values.map((val) => ({ value: val, left: null, right: null }))

  // Build complete binary tree structure
  for (let i = 0; i < Math.floor(nodes.length / 2); i++) {
    const leftIndex = 2 * i + 1
    const rightIndex = 2 * i + 2

    if (leftIndex < nodes.length) {
      nodes[i].left = nodes[leftIndex]
    }
    if (rightIndex < nodes.length) {
      nodes[i].right = nodes[rightIndex]
    }
  }

  return formatTreeOutput(nodes[0], constraint.outputFormat || "parent_array")
}

function generateNaryTree(values: number[], constraint: TreeConstraint): any {
  if (values.length === 0) return null

  const maxChildren = constraint.maxChildren ?? 3
  const nodes = values.map((val) => ({ value: val, children: [] as any[] }))

  // Build n-ary tree structure
  let nodeIndex = 1
  for (let i = 0; i < nodes.length && nodeIndex < nodes.length; i++) {
    const childCount = Math.min(Math.floor(Math.random() * maxChildren) + 1, nodes.length - nodeIndex)

    for (let j = 0; j < childCount && nodeIndex < nodes.length; j++) {
      nodes[i].children.push(nodes[nodeIndex])
      nodeIndex++
    }
  }

  return formatTreeOutput(nodes[0], constraint.outputFormat || "parent_array")
}

function generateBST(values: number[], constraint: TreeConstraint): any {
  // Sort values for BST property
  const sortedValues = [...values].sort((a, b) => a - b)

  function buildBST(arr: number[], start: number, end: number): any {
    if (start > end) return null

    const mid = Math.floor((start + end) / 2)
    const node = {
      value: arr[mid],
      left: buildBST(arr, start, mid - 1),
      right: buildBST(arr, mid + 1, end),
    }

    return node
  }

  const root = buildBST(sortedValues, 0, sortedValues.length - 1)
  return formatTreeOutput(root, constraint.outputFormat || "parent_array")
}

function formatTreeOutput(root: any, format: string): any {
  switch (format) {
    case "parent_array":
      return treeToParentArray(root)
    case "adjacency_list":
      return treeToAdjacencyList(root)
    case "level_order":
      return treeToLevelOrder(root)
    case "preorder":
      return treeToPreorder(root)
    default:
      return treeToParentArray(root)
  }
}

function treeToParentArray(root: any): number[] {
  if (!root) return []

  const result: number[] = []
  const queue = [{ node: root, index: 0 }]
  const nodeMap = new Map()

  while (queue.length > 0) {
    const { node, index } = queue.shift()!

    if (index >= result.length) {
      result.length = index + 1
      result.fill(-1, result.length - (index + 1 - result.length))
    }

    result[index] = node.value
    nodeMap.set(node, index)

    if (node.left) {
      queue.push({ node: node.left, index: 2 * index + 1 })
    }
    if (node.right) {
      queue.push({ node: node.right, index: 2 * index + 2 })
    }
    if (node.children) {
      node.children.forEach((child: any, i: number) => {
        queue.push({ node: child, index: index * 3 + i + 1 })
      })
    }
  }

  return result
}

function treeToAdjacencyList(root: any): number[][] {
  if (!root) return []

  const adjList: number[][] = []
  const nodeMap = new Map()
  let nodeIndex = 0

  function traverse(node: any): number {
    if (!node) return -1

    const currentIndex = nodeIndex++
    nodeMap.set(node, currentIndex)
    adjList[currentIndex] = []

    if (node.left) {
      const leftIndex = traverse(node.left)
      adjList[currentIndex].push(leftIndex)
    }
    if (node.right) {
      const rightIndex = traverse(node.right)
      adjList[currentIndex].push(rightIndex)
    }
    if (node.children) {
      node.children.forEach((child: any) => {
        const childIndex = traverse(child)
        adjList[currentIndex].push(childIndex)
      })
    }

    return currentIndex
  }

  traverse(root)
  return adjList
}

function treeToLevelOrder(root: any): number[] {
  if (!root) return []

  const result: number[] = []
  const queue = [root]

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node.value)

    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
    if (node.children) {
      queue.push(...node.children)
    }
  }

  return result
}

function treeToPreorder(root: any): number[] {
  if (!root) return []

  const result: number[] = []

  function traverse(node: any) {
    if (!node) return

    result.push(node.value)
    if (node.left) traverse(node.left)
    if (node.right) traverse(node.right)
    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(root)
  return result
}

function generateDefaultTree(): number[] {
  GenerationLogger.debug("🌳 Generating default binary tree")
  const values = [1, 2, 3, 4, 5]
  return values
}
