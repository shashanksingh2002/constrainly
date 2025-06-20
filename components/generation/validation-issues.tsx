import { AlertCircle } from "lucide-react"
import type { ValidationIssue } from "@/lib/utils/validation"

interface ValidationIssuesProps {
  issues: ValidationIssue[]
}

export function ValidationIssues({ issues }: ValidationIssuesProps) {
  if (issues.length === 0) return null

  return (
    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
      <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
        <AlertCircle className="w-4 h-4" />
        Validation Issues
      </div>
      <ul className="text-xs text-destructive space-y-1">
        {issues.map((issue, index) => (
          <li key={index}>
            • {issue.variableName}: {issue.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
