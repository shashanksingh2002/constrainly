import { Hash, Type, List, Grid, TreePine, Network } from "lucide-react"
import type { VariableType } from "@/types/variables"

export const VARIABLE_TYPE_ICONS = {
  int: Hash,
  float: Hash,
  double: Hash,
  string: Type,
  array: List,
  matrix: Grid,
  tree: TreePine,
  graph: Network,
} as const

export const VARIABLE_TYPE_COLORS = {
  int: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  float: { bg: "#dcfce7", border: "#22c55e", text: "#15803d" },
  double: { bg: "#f3e8ff", border: "#a855f7", text: "#7c3aed" },
  string: { bg: "#fef3c7", border: "#f59e0b", text: "#d97706" },
  array: { bg: "#fed7aa", border: "#ea580c", text: "#c2410c" },
  matrix: { bg: "#fecaca", border: "#ef4444", text: "#dc2626" },
  tree: { bg: "#d1fae5", border: "#10b981", text: "#059669" },
  graph: { bg: "#e0e7ff", border: "#6366f1", text: "#4f46e5" },
} as const

export const VARIABLE_TYPE_LABELS: Record<VariableType, string> = {
  int: "Integer",
  float: "Float",
  double: "Double",
  string: "String",
  array: "Array",
  matrix: "Matrix",
  tree: "Tree",
  graph: "Graph",
} as const
