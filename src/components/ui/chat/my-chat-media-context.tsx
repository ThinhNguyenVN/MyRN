import { createContext, useContext } from 'react'
import type { ChatAdapter } from '@thinhnguyenvn/chat-core'

export interface MyChatMediaContextValue {
  /** Media id → URI on this device, from the user's own photo messages. */
  localUris: Map<string, string>
  /** Gateway source for ids with no local URI (`GET /media/:id`). */
  mediaSource?: ChatAdapter['mediaSource']
}

const MyChatMediaContext = createContext<MyChatMediaContextValue>({ localUris: new Map() })

export const MyChatMediaProvider = MyChatMediaContext.Provider

export function useMyChatMedia(): MyChatMediaContextValue {
  return useContext(MyChatMediaContext)
}
