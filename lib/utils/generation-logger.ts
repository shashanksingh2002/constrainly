export class GenerationLogger {
  private static indent = 0

  static log(message: string, data?: any) {
    const prefix = "  ".repeat(this.indent)
    if (data !== undefined) {
      console.log(`${prefix}${message}`, data)
    } else {
      console.log(`${prefix}${message}`)
    }
  }

  static debug(message: string, data?: any) {
    this.log(`🔍 ${message}`, data)
  }

  static success(message: string, data?: any) {
    this.log(`✅ ${message}`, data)
  }

  static warn(message: string, data?: any) {
    this.log(`⚠️ ${message}`, data)
  }

  static error(message: string, data?: any) {
    this.log(`❌ ${message}`, data)
  }

  static section(title: string) {
    console.log(`\n=== ${title} ===`)
  }

  static subsection(title: string) {
    console.log(`\n--- ${title} ---`)
  }

  static indent() {
    this.indent++
  }

  static outdent() {
    this.indent = Math.max(0, this.indent - 1)
  }

  static withIndent<T>(fn: () => T): T {
    this.indent()
    try {
      return fn()
    } finally {
      this.outdent()
    }
  }
}
