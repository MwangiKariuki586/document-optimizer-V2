type LogFields = Record<string, unknown>;

export function devLog(
  scope: string,
  event: string,
  fields?: LogFields,
): void {
  if (process.env.NODE_ENV === "production") return;

  if (fields) {
    console.info(`[${scope}] ${event}`, fields);
    return;
  }

  console.info(`[${scope}] ${event}`);
}
