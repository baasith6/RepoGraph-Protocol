export type LogLevel = "info" | "warn" | "error" | "debug";

export function log(level: LogLevel, message: string): void {
  const prefix = `[repograph]`;
  switch (level) {
    case "error":
      console.error(`${prefix} ERROR: ${message}`);
      break;
    case "warn":
      console.warn(`${prefix} WARN: ${message}`);
      break;
    case "debug":
      if (process.env.REPOGRAPH_DEBUG) {
        console.debug(`${prefix} DEBUG: ${message}`);
      }
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}
