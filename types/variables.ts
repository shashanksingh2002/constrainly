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
  // Value-based dependencies
  dependsOnValue?: {
    variableId: string
    relationship:
      | "less_than"
      | "less_equal"
      | "greater_than"
      | "greater_equal"
      | "equal_to"
      | "multiple_of"
      | "factor_of"
      | "custom"
    multiplier?: number
    offset?: number
    customFormula?: string
  }
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
  elementDependsOnValue?: {
    variableId: string
    relationship: "less_than" | "less_equal" | "greater_than" | "greater_equal" | "bounded_by"
  }
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
  matrixType?: "rectangular" | "square" | "triangular" | "diagonal" | "sparse"
  symmetric?: boolean
  positiveDefinite?: boolean
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
  treeType: "binary" | "nary" | "bst" | "avl" | "heap" | "trie"
  maxChildren?: number
  heapType?: "min" | "max"
  maxDepth?: number
  minDepth?: number
  minValue?: number
  maxValue?: number
  balanced?: boolean
  complete?: boolean
  full?: boolean
  perfect?: boolean
  customRules?: string
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
  graphType: "directed" | "undirected" | "dag" | "tree" | "bipartite" | "complete"
  connected?: boolean
  weighted?: boolean
  cyclic?: boolean
  selfLoops?: boolean
  maxDegree?: number
  minDegree?: number
  minWeight?: number
  maxWeight?: number
  minNodeValue?: number
  maxNodeValue?: number
  customRules?: string
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

export interface OutputLine {
  id: string
  type: "single" | "space_separated" | "newline_separated" | "custom"
  variableIds: string[] // Fixed: was 'variables'
  customSeparator?: string
  description?: string
}

export interface OutputFormat {
  id: string
  name: string
  structure: OutputLine[]
}

export interface TestcaseProject {
  id: string
  name: string
  variables: Variable[]
  outputFormat: OutputFormat
  createdAt: Date
  updatedAt: Date
}
