import type { Variable, StringConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function generateStringValue(variable: Variable, existingValues: Record<string, any>): string {
  const constraint = variable.constraints as StringConstraint

  // Determine string length
  let length: number
  if (constraint.lengthType === "linked" && constraint.linkedLengthVariable) {
    length = existingValues[constraint.linkedLengthVariable] || 5
    GenerationLogger.debug(`🔗 String length linked to variable: ${length}`)
  } else {
    const minLength = constraint.minLength || 1
    const maxLength = constraint.maxLength || 10
    length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength
    GenerationLogger.debug(`📏 String length: ${length} (range: ${minLength}-${maxLength})`)
  }

  // Define character sets
  const charSets = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  }

  let availableChars = ""
  if (constraint.allowLowercase) availableChars += charSets.lowercase
  if (constraint.allowUppercase) availableChars += charSets.uppercase
  if (constraint.allowDigits) availableChars += charSets.digits
  if (constraint.allowSpecial) availableChars += charSets.special

  // Default to lowercase if no character set selected
  if (!availableChars) {
    availableChars = charSets.lowercase
    GenerationLogger.debug(`⚠️ No character set selected, using lowercase`)
  }

  GenerationLogger.debug(`🔤 Character set: ${availableChars.length} characters`)

  let result = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * availableChars.length)
    result += availableChars[randomIndex]
  }

  GenerationLogger.debug(`✅ Generated string: "${result}"`)
  return result
}
