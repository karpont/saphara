/** Yapilandirilmis hata/olay izleme. Sentry-uyumlu bir sink'e baglanabilir. */
type Level = "debug" | "info" | "warn" | "error";
export interface LogEvent { level: Level; msg: string; ctx?: Record<string, unknown>; ts: string; }

export function createLogger(sink?: (e: LogEvent) => void) {
  const emit = (level: Level, msg: string, ctx?: Record<string, unknown>) => {
    const e: LogEvent = { level, msg, ctx, ts: new Date().toISOString() };
    (sink ?? ((x) => console[level === "debug" ? "log" : level](x)))(e);
  };
  return {
    debug: (m: string, c?: Record<string, unknown>) => emit("debug", m, c),
    info: (m: string, c?: Record<string, unknown>) => emit("info", m, c),
    warn: (m: string, c?: Record<string, unknown>) => emit("warn", m, c),
    error: (m: string, c?: Record<string, unknown>) => emit("error", m, c),
  };
}
