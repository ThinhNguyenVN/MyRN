import { useEffect, useRef } from 'react'

export interface ChatPendingPrompt {
  id: string
  text: string
}

/** Calls `send(text)` once per `pendingPrompt.id`; a repeated id (re-render, same object) is ignored. */
export function usePendingPrompt(
  pendingPrompt: ChatPendingPrompt | undefined,
  send: (text: string) => void,
) {
  const sentIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pendingPrompt || sentIdRef.current === pendingPrompt.id) {
      return
    }
    sentIdRef.current = pendingPrompt.id
    send(pendingPrompt.text)
  }, [pendingPrompt, send])
}
