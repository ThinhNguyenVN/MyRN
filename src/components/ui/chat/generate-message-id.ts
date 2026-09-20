let counter = 0

/** Monotonic id, không cần dependency `uuid`/`nanoid` — chỉ cần unique trong 1 session. */
export function generateMessageId(prefix = 'msg'): string {
  counter += 1
  return `${prefix}_${Date.now()}_${counter}`
}
