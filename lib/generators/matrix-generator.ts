import type { Variable, MatrixConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function generateMatrixValue(variable: Variable, existingValues: Record<string, any>): number[][] {
  const constraint = variable.constraints as MatrixConstraint

  // Determine matrix dimensions
  let rows: number, cols: number

  if (constraint.rowsType === "linked" && constraint.linkedRowVariable) {
    rows = existingValues[constraint.linkedRowVariable] || 3
    GenerationLogger.debug(`🔗 Matrix rows linked to variable: ${rows}`)
  } else {
    const minRows = constraint.minRows || 1
    const maxRows = constraint.maxRows || 5
    rows = Math.floor(Math.random() * (maxRows - minRows + 1)) + minRows
    GenerationLogger.debug(`📏 Matrix rows: ${rows} (range: ${minRows}-${maxRows})`)
  }

  if (constraint.colsType === "linked" && constraint.linkedColVariable) {
    cols = existingValues[constraint.linkedColVariable] || 3
    GenerationLogger.debug(`🔗 Matrix cols linked to variable: ${cols}`)
  } else {
    const minCols = constraint.minCols || 1
    const maxCols = constraint.maxCols || 5
    cols = Math.floor(Math.random() * (maxCols - minCols + 1)) + minCols
    GenerationLogger.debug(`📏 Matrix cols: ${cols} (range: ${minCols}-${maxCols})`)
  }

  // Handle square matrix constraint
  if (constraint.matrixType === "square") {
    cols = rows
    GenerationLogger.debug(`⬜ Square matrix: ${rows}×${rows}`)
  }

  const cellMin = constraint.cellMin || 0
  const cellMax = constraint.cellMax || 100

  GenerationLogger.debug(`🎯 Matrix type: ${constraint.matrixType || "rectangular"}`)
  GenerationLogger.debug(`📊 Cell range: [${cellMin}, ${cellMax}]`)

  const matrix: number[][] = []

  // Generate matrix based on type
  for (let i = 0; i < rows; i++) {
    const row: number[] = []
    for (let j = 0; j < cols; j++) {
      let value = 0

      switch (constraint.matrixType) {
        case "diagonal":
          value = i === j ? Math.floor(Math.random() * (cellMax - cellMin + 1)) + cellMin : 0
          break
        case "triangular":
          value = i <= j ? Math.floor(Math.random() * (cellMax - cellMin + 1)) + cellMin : 0
          break
        case "sparse":
          // 10-30% non-zero elements
          const sparsity = 0.1 + Math.random() * 0.2
          value = Math.random() < sparsity ? Math.floor(Math.random() * (cellMax - cellMin + 1)) + cellMin : 0
          break
        default: // rectangular or square
          value = Math.floor(Math.random() * (cellMax - cellMin + 1)) + cellMin
      }

      row.push(value)
    }
    matrix.push(row)
  }

  // Handle symmetric constraint
  if (constraint.symmetric && rows === cols) {
    for (let i = 0; i < rows; i++) {
      for (let j = i + 1; j < cols; j++) {
        matrix[j][i] = matrix[i][j]
      }
    }
    GenerationLogger.debug(`🔄 Applied symmetric constraint`)
  }

  GenerationLogger.debug(`✅ Generated ${rows}×${cols} matrix`)
  return matrix
}
