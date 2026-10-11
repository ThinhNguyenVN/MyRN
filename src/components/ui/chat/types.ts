import type { ReactElement } from 'react'
import type { CustomMessage } from '@thinhnguyenvn/chat-core'

/** Return `null` when the app doesn't recognize `message.customType` — MyChat falls back to `MyChatUnknownMessage`. */
export type RenderCustomMessage = (message: CustomMessage) => ReactElement | null
