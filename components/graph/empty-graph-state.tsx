import { Network } from "lucide-react"

export function EmptyGraphState() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold mb-2">Interactive Dependency Graph</h2>
        <p className="text-sm text-muted-foreground">Visual representation of variable relationships</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Network className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No variables to visualize</p>
          <p className="text-sm">Add variables to see their interactive dependency graph</p>
        </div>
      </div>
    </div>
  )
}
