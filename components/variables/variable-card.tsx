"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import type { Variable } from "@/types/variables"
import { VARIABLE_TYPE_ICONS, VARIABLE_TYPE_COLORS } from "@/lib/constants/variable-types"
import { ConstraintBuilder } from "./constraints/constraint-builder"

interface VariableCardProps {
  variable: Variable
  variables: Variable[]
  onUpdate: (updates: Partial<Variable>) => void
  onRemove: () => void
}

export function VariableCard({ variable, variables, onUpdate, onRemove }: VariableCardProps) {
  const Icon = VARIABLE_TYPE_ICONS[variable.type]
  const colors = VARIABLE_TYPE_COLORS[variable.type]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {variable.name}
            <Badge className={`bg-[${colors.bg}] text-[${colors.text}] border-[${colors.border}]`}>
              {variable.type}
            </Badge>
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
