type LogLevel = "debug" | "info" | "success" | "warn" | "error"

export class GenerationLogger {
  /*
    Simple static logger with indentation support.
    Every call respects `indentLevel` so nested operations are easier to read.
  */
  private static indentLevel = 0
  private static enabled = true

  // ────────────────────────────────────────────────────────────────────────────
  // Public helpers
  // ────────────────────────────────────────────────────────────────────────────
  static section(title: string) {
    this.log("\n=== " + title.toUpperCase() + " ===")
  }

  static subsection(title: string) {
    this.log("\n--- " + title + " ---")
  }

  static log(...args: any[]) {
    this.print("info", ...args)
  }

  static debug(...args: any[]) {
    this.print("debug", "🔍", ...args)
  }

  static success(...args: any[]) {
    this.print("success", "✅", ...args)
  }

  static warn(...args: any[]) {
    this.print("warn", "⚠️", ...args)
  }

  static error(...args: any[]) {
    this.print("error", "❌", ...args)
  }

  // Execute a callback with one extra indentation level
  static withIndent<T>(fn: () => T): T {
    GenerationLogger.indent()
    try {
      return fn()
    } finally {
      GenerationLogger.outdent()
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────────────────────────
  private static indent() {
    GenerationLogger.indentLevel++
  }

  private static outdent() {
    GenerationLogger.indentLevel = Math.max(0, GenerationLogger.indentLevel - 1)
  }

  private static print(level: LogLevel, ...args: any[]) {
    if (!GenerationLogger.enabled) return
    const prefix = " ".repeat(GenerationLogger.indentLevel * 2)
    // eslint-disable-next-line no-console
    console[level === "error" ? "error" : "log"](prefix, ...args)
  }
}
