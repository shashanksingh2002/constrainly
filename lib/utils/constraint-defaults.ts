import type { VariableType, VariableConstraint } from "@/types/variables"

export function getDefaultConstraint(type: VariableType): VariableConstraint {
  switch (type) {
    case "int":
    case "float":
    case "double":
      return { type: "scalar" }
    case "array":
      return { type: "array", sizeType: "manual" }
    case "matrix":
      return { type: "matrix", rowsType: "manual", colsType: "manual" }
    case "string":
      return { type: "string", lengthType: "manual", charSet: "lowercase" }
    case "tree":
      return { type: "tree", nodeCountType: "manual", treeType: "binary" }
    case "graph":
      return {
        type: "graph",
        nodesType: "manual",
        edgesType: "manual",
        graphType: "undirected",
      }
    default:
      return { type: "scalar" }
  }
}
