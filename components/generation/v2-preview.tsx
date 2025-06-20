import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download, Link, Sparkles } from "lucide-react"

export function V2Preview() {
  return (
    <div className="space-y-4 opacity-60">
      <div>
        <Label className="text-muted-foreground">V2 Features (Coming Soon)</Label>
      </div>

      <div className="space-y-3">
        <div className="p-3 border border-dashed border-muted-foreground/30 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-4 h-4" />
            <span className="text-sm font-medium">Problem Link Integration</span>
          </div>
          <Input placeholder="Paste Leetcode/Codeforces URL..." disabled className="text-xs" />
        </div>

        <div className="p-3 border border-dashed border-muted-foreground/30 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Generation</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Random: 5" disabled className="text-xs" />
            <Input placeholder="AI Edge: 3" disabled className="text-xs" />
          </div>
        </div>

        <Button disabled className="w-full" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Smart Generate (V2)
        </Button>
      </div>
    </div>
  )
}
