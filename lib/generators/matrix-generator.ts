import type { Variable, MatrixConstraint } from "@/types/variables"
import { GenerationLogger } from "../utils/generation-logger"

export function generateMatrixValue(variable: Variable, existingValues: Record<string, any>): number[][] {
  const constraint = variable.constraint as MatrixConstraint

  GenerationLogger.debug(`🔲 Generating matrix ${variable.name}`)
  GenerationLogger.debug(`🔲 Matrix type: ${constraint.matrixType || "rectangular"}`)

  // Determine matrix dimensions
  const { rows, cols } = determineDimensions(constraint, existingValues)

  GenerationLogger.debug(`🔲 Final matrix dimensions: ${rows} × ${cols}`)

  // Cell value constraints
  const cellMin = constraint.cellMin ?? 0
  const cellMax = constraint.cellMax ?? 100

  // Initialize matrix
  const matrix: number[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0))

  // Generate matrix based on type
  const result = GenerationLogger.withIndent(() => {
    switch (constraint.matrixType) {
      case "diagonal":
        return generateDiagonalMatrix(matrix, rows, cols, cellMin, cellMax)
      case "triangular":
        return generateTriangularMatrix(matrix, rows, cols, cellMin, cellMax)
      case "sparse":
        return generateSparseMatrix(matrix, rows, cols, cellMin, cellMax)
      case "square":
      case "rectangular":
      default:
        return generateStandardMatrix(matrix, rows, cols, cellMin, cellMax, constraint.symmetric)
    }
  })

  GenerationLogger.success(`Generated ${rows}×${cols} matrix`)
  return result
}

function determineDimensions(
  constraint: MatrixConstraint,
  existingValues: Record<string, any>,
): { rows: number; cols: number } {
  let rows = constraint.minRows || 3
  let cols = constraint.minCols || 3

  // Handle row dependencies
  if (constraint.rowsType === "linked" && constraint.linkedRowVariable) {
    const linkedRowValue = existingValues[constraint.linkedRowVariable]
    if (linkedRowValue !== undefined) {
      rows = linkedRowValue
      GenerationLogger.debug(`🔗 Rows linked to ${constraint.linkedRowVariable}: ${rows}`)
    }
  } else if (constraint.rowsType === "manual") {
    const minRows = constraint.minRows || 1
    const maxRows = constraint.maxRows || 10
    rows = Math.floor(Math.random() * (maxRows - minRows + 1)) + minRows
    GenerationLogger.debug(`📏 Random rows in range [${minRows}, ${maxRows}]: ${rows}`)
  }

  // Handle column dependencies
  if (constraint.matrixType === "square") {
    cols = rows
    GenerationLogger.debug(`⬜ Square matrix: cols = rows = ${cols}`)
  } else if (constraint.colsType === "linked" && constraint.linkedColVariable) {
    const linkedColValue = existingValues[constraint.linkedColVariable]
    if (linkedColValue !== undefined) {
      cols = linkedColValue
      GenerationLogger.debug(`🔗 Cols linked to ${constraint.linkedColVariable}: ${cols}`)
    }
  } else if (constraint.colsType === "manual") {
    const minCols = constraint.minCols || 1
    const maxCols = constraint.maxCols || 10
    cols = Math.floor(Math.random() * (maxCols - minCols + 1)) + minCols
    GenerationLogger.debug(`📏 Random cols in range [${minCols}, ${maxCols}]: ${cols}`)
  }

  return { rows, cols }
}

function generateStandardMatrix(
  matrix: number[][],
  rows: number,
  cols: number,
  cellMin: number,
  cellMax: number,
  symmetric?: boolean,
): number[][] {
  GenerationLogger.debug(`📊 Generating standard matrix (${rows}×${cols})`)

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (symmetric && i > j && rows === cols) {
        // For symmetric matrices, copy from upper triangle
        matrix[i][j] = matrix[j][i]
      } else {
        matrix[i][j] = Math.floor(Math.random() * (cellMax - cellMin + 1)) + cellMin
      }
    }
  }

  return matrix
}

function generateDiagonalMatrix(
  matrix: number[][],
  rows: number,
  cols: number,
  cellMin: number,
  cellMax: number,
): number[][] {
  GenerationLogger.debug(`🔸 Generating diagonal matrix`)

  const minDim = Math.min(rows, cols)

  // Fill diagonal elements
  for (let i = 0; i < minDim; i++) {
    matrix[i][i] = Math.floor(Math.random() * (cellMax - cellMin + 1)) + cellMin
  }

  GenerationLogger.debug(`🔸 Filled ${minDim} diagonal elements`)
  return matrix
}

function generateTriangularMatrix(
  matrix: number[][],
  rows: number,
  cols: number,
  cellMin: number,
  cellMax: number,
): number[][] {
  GenerationLogger.debug(`🔺 Generating triangular matrix (upper triangular)`)

  let filledCells = 0
  // Generate upper triangular matrix
  for (let i = 0; i < rows; i++) {
    for (let j = i; j < cols; j++) {
      matrix[i][j] = Math.floor(Math.random() * (cellMax - cellMin + 1)) + cellMin
      filledCells++
    }
  }

  GenerationLogger.debug(`🔺 Filled ${filledCells} upper triangular cells`)
  return matrix
}

function generateSparseMatrix(
  matrix: number[][],
  rows: number,
  cols: number,
  cellMin: number,
  cellMax: number,
): number[][] {
  GenerationLogger.debug(`🕳️ Generating sparse matrix`)

  const totalCells = rows * cols
  const sparsityFactor = 0.1 + Math.random() * 0.2 // 10-30% non-zero elements
  const nonZeroCells = Math.floor(totalCells * sparsityFactor)

  GenerationLogger.debug(
    `🕳️ Sparse matrix: ${nonZeroCells}/${totalCells} non-zero cells (${(sparsityFactor * 100).toFixed(1)}% density)`,
  )

  // Randomly place non-zero elements
  const positions = new Set<string>()

  while (positions.size < nonZeroCells) {
    const i = Math.floor(Math.random() * rows)
    const j = Math.floor(Math.random() * cols)
    const key = `${i},${j}`

    if (!positions.has(key)) {
      positions.add(key)
      matrix[i][j] = Math.floor(Math.random() * (cellMax - cellMin + 1)) + cellMin
    }
  }

  return matrix
}
