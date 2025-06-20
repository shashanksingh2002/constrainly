export type VariableType = "int" | "float" | "double" | "string" | "array" | "matrix" | "tree" | "graph"

export interface BaseConstraint {
  type: string
}

export interface ScalarConstraint extends BaseConstraint {
  type: "scalar"
  min?: number
  max?: number
  customLogic?: string
  disallowedValues?: number[]
}

export interface ArrayConstraint extends BaseConstraint {
  type: "array"
  sizeType: "manual" | "linked"
  minSize?: number
  maxSize?: number
  linkedVariable?: string
  elementMin?: number
  elementMax?: number
  elementRules?: string
  distinct?: boolean
  sorted?: boolean
}

export interface MatrixConstraint extends BaseConstraint {
  type: "matrix"
  rowsType: "manual" | "linked"
  colsType: "manual" | "linked"
  minRows?: number
  maxRows?: number
  minCols?: number
  maxCols?: number
  linkedRowVariable?: string
  linkedColVariable?: string
  cellMin?: number
  cellMax?: number
  cellRules?: string
}

export interface StringConstraint extends BaseConstraint {
  type: "string"
  lengthType: "manual" | "linked"
  minLength?: number
  maxLength?: number
  linkedVariable?: string
  charSet: "lowercase" | "uppercase" | "digits" | "alphanumeric" | "custom"
  customCharSet?: string
  pattern?: string
}

export interface TreeConstraint extends BaseConstraint {
  type: "tree"
  nodeCountType: "manual" | "linked"
  minNodes?: number
  maxNodes?: number
  linkedVariable?: string
  treeType: "binary" | "nary"
  maxDepth?: number
  rootValue?: number
}

export interface GraphConstraint extends BaseConstraint {
  type: "graph"
  nodesType: "manual" | "linked"
  edgesType: "manual" | "linked"
  minNodes?: number
  maxNodes?: number
  minEdges?: number
  maxEdges?: number
  linkedNodeVariable?: string
  linkedEdgeVariable?: string
  graphType: "directed" | "undirected"
  connected?: boolean
  weighted?: boolean
  cyclic?: boolean
  maxDegree?: number
}

export type VariableConstraint =
  | ScalarConstraint
  | ArrayConstraint
  | MatrixConstraint
  | StringConstraint
  | TreeConstraint
  | GraphConstraint

export interface Variable {
  id: string
  name: string
  type: VariableType
  constraint: VariableConstraint
  dependencies: string[]
}
