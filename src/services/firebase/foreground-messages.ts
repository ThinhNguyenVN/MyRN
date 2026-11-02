/** Pushes received while the app is open. Shared by native and web messaging. */
export type ForegroundMessageHandler = (data: Record<string, string>) => void

const handlers = new Set<ForegroundMessageHandler>()

/** FCM `data` values are strings; anything else (RNFirebase allows objects) is dropped. */
export function emitForegroundMessage(data: Record<string, unknown> | undefined): void {
  const payload: Record<string, string> = {}
  Object.entries(data ?? {}).forEach(([key, value]) => {
    if (typeof value === 'string') payload[key] = value
  })
  handlers.forEach((handler) => {
    try {
      handler(payload)
    } catch (error) {
      if (__DEV__) console.warn('[firebase] foreground message handler failed', error)
    }
  })
}

/**
 * Calls `handler` with the push `data` whenever a push arrives while the app is in the
 * foreground (e.g. refresh an unread badge). Display is still handled by the kit.
 */
export function subscribeForegroundMessages(handler: ForegroundMessageHandler): () => void {
  handlers.add(handler)
  return () => {
    handlers.delete(handler)
  }
}
