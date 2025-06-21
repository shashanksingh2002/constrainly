export class GenerationLogger {
  private static indentLevel = 0
  private static readonly INDENT_SIZE = 2

  static section(title: string) {
    console.log(`\n=== ${title} ===`)
  }

  static subsection(title: string) {
    console.log(`\n--- ${title} ---`)
  }

  static log(message: string, data?: any) {
    const indent = " ".repeat(this.indentLevel * this.INDENT_SIZE)
    if (data !== undefined) {
      console.log(`${indent}${message}`, data)
    } else {
      console.log(`${indent}${message}`)
    }
  }

  static debug(message: string, data?: any) {
    const indent = " ".repeat(this.indentLevel * this.INDENT_SIZE)
    if (data !== undefined) {
      console.log(`${indent}🔍 ${message}`, data)
    } else {
      console.log(`${indent}🔍 ${message}`)
    }
  }

  static success(message: string, data?: any) {
    const indent = " ".repeat(this.indentLevel * this.INDENT_SIZE)
    if (data !== undefined) {
      console.log(`${indent}✅ ${message}`, data)
    } else {
      console.log(`${indent}✅ ${message}`)
    }
  }

  static warn(message: string, data?: any) {
    const indent = " ".repeat(this.indentLevel * this.INDENT_SIZE)
    if (data !== undefined) {
      console.warn(`${indent}⚠️ ${message}`, data)
    } else {
      console.warn(`${indent}⚠️ ${message}`)
    }
  }

  static error(message: string, data?: any) {
    const indent = " ".repeat(this.indentLevel * this.INDENT_SIZE)
    if (data !== undefined) {
      console.error(`${indent}❌ ${message}`, data)
    } else {
      console.error(`${indent}❌ ${message}`)
    }
  }

  static indent() {
    this.indentLevel++
  }

  static outdent() {
    this.indentLevel = Math.max(0, this.indentLevel - 1)
  }

  static withIndent<T>(fn: () => T): T {
    GenerationLogger.indent()
    try {
      return fn()
    } finally {
      GenerationLogger.outdent()
    }
  }
}
