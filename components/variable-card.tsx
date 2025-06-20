"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Hash, Type, List, Grid, TreePine, Network } from "lucide-react"
import type { Variable } from "@/types/variable"
import { ConstraintBuilder } from "@/components/constraint-builder"

interface VariableCardProps {
  variable: Variable
  variables: Variable[]
  onUpdate: (updates: Partial<Variable>) => void
  onRemove: () => void
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
  int: "bg-blue-100 text-blue-800",
  float: "bg-green-100 text-green-800",
  double: "bg-purple-100 text-purple-800",
  string: "bg-yellow-100 text-yellow-800",
  array: "bg-orange-100 text-orange-800",
  matrix: "bg-red-100 text-red-800",
  tree: "bg-emerald-100 text-emerald-800",
  graph: "bg-indigo-100 text-indigo-800",
}

export function VariableCard({ variable, variables, onUpdate, onRemove }: VariableCardProps) {
  const Icon = typeIcons[variable.type]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {variable.name}
            <Badge className={typeColors[variable.type]}>{variable.type}</Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ConstraintBuilder variable={variable} variables={variables} onUpdate={onUpdate} />
      </CardContent>
    </Card>
  )
}
