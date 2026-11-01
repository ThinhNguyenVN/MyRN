/** FCM token + the handlers that receive it. Shared by native and web messaging. */
export type PushTokenHandler = (token: string) => void | Promise<void>

let currentToken: string | null = null
const tokenHandlers = new Set<PushTokenHandler>()

function callHandler(handler: PushTokenHandler, token: string) {
  Promise.resolve()
    .then(() => handler(token))
    .catch((error) => {
      if (__DEV__) console.warn('[firebase] push token handler failed', error)
    })
}

export function emitPushToken(token: string | null | undefined): void {
  if (!token || token === currentToken) return
  currentToken = token
  tokenHandlers.forEach((handler) => callHandler(handler, token))
}

/**
 * Registers where the FCM token goes (usually: send it to your backend for the signed-in
 * user). Called right away with the current token if there is one, then on every refresh.
 */
export function setPushTokenHandler(handler: PushTokenHandler): () => void {
  tokenHandlers.add(handler)
  if (currentToken) callHandler(handler, currentToken)
  return () => {
    tokenHandlers.delete(handler)
  }
}

export function getPushToken(): string | null {
  return currentToken
}
