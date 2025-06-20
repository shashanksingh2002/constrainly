import { Plus } from "lucide-react"

export function EmptyVariableState() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Plus className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-lg font-medium">No variables defined yet</p>
      <p className="text-sm">Add your first variable above to get started</p>
    </div>
  )
}
