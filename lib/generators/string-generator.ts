import type { Variable, StringConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function generateStringValue(variable: Variable, existingValues: Record<string, any>): string {
  const constraint = variable.constraint as StringConstraint

  let length = constraint.minLength || 5

  // Handle linked length
  if (constraint.lengthType === "linked" && constraint.linkedVariable) {
    const linkedValue = existingValues[constraint.linkedVariable]
    if (linkedValue !== undefined) {
      length = linkedValue
      GenerationLogger.debug(`🔗 String length linked to ${constraint.linkedVariable}: ${length}`)
    }
  } else if (constraint.lengthType === "manual") {
    const minLength = constraint.minLength || 1
    const maxLength = constraint.maxLength || 20
    length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength
    GenerationLogger.debug(`📏 Random string length in range [${minLength}, ${maxLength}]: ${length}`)
  }

  // Determine character set
  let chars = ""
  switch (constraint.charSet) {
    case "lowercase":
      chars = "abcdefghijklmnopqrstuvwxyz"
      break
    case "uppercase":
      chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      break
    case "digits":
      chars = "0123456789"
      break
    case "alphanumeric":
      chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      break
    case "custom":
      chars = constraint.customCharSet || "abcdefghijklmnopqrstuvwxyz"
      break
    default:
      chars = "abcdefghijklmnopqrstuvwxyz"
  }

  GenerationLogger.debug(`Generating string of length ${length} from charset: ${constraint.charSet}`)

  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  GenerationLogger.success(`Generated string: "${result}"`)
  return result
}
