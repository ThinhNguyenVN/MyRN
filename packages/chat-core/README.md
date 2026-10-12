# @thinhnguyenvn/chat-core

Chat state and transport for the MyChat UI: message types, `conversationReducer`,
`useConversation`, the `ChatAdapter` interface, `createHttpChatAdapter` (NDJSON over HTTP, the
gateway chat contract) and `MockChatAdapter`. No UI, no theme, no app aliases: it runs in any
React Native (or React Native Web) app.

Source lives in the MyRN repo under `packages/chat-core/`. MyRN's own `MyChat` UI
(`src/components/ui/chat`) is built on it.

## Install

```sh
yarn add @thinhnguyenvn/chat-core
```

Peer dependencies: `react` and `react-native`. The package ships CommonJS + `.d.ts`, so Metro and
Jest use it without extra `transformIgnorePatterns` or Babel config.

## Use

```ts
import { createHttpChatAdapter, useConversation } from '@thinhnguyenvn/chat-core'

const adapter = createHttpChatAdapter({
  url: 'http://localhost:3300/chat',
  headers: { Authorization: `Bearer ${token}` },
  contractVersion: 3,
  getLocale: () => i18n.language,
  // Optional: keep the conversation on the gateway.
  session: { appId: 'my-store', userId: String(user.id), storage },
})

const { messages, send, sendMedia } = useConversation({ adapter })
```

### Photos (contract v3)

With `contractVersion: 3` and `session`, `sendMedia(files, caption)` uploads each file to
`POST /media` first and then sends `send_media` with the ids. Without either (or with
`MockChatAdapter`) it sends `send_images` like before. `files` are `{ uri, name, mimeType, file? }`;
on web pass the picked `File` as `file`. Send JPEG/PNG/WebP/HEIC up to 5 MB.

Ids the gateway shows on cards (`media_choice.media`, `confirmation.media`) are drawn from the local
URI when this device sent them (`localMediaUris(messages)`), else from `adapter.mediaSource(id)`
(`GET /media/:id` with the chat headers; `404` after 24h, show a placeholder). Answer a
`media_choice` card with `selectMedia(messageId, ids)`.

### Session storage

`session` is optional. When set, the adapter sends `X-Chat-Session` and stores the id the gateway
returns under the key `chat.session.<appId>.<userId>`. The package does not pick a storage: the
app passes one with async `getItem`, `setItem` and `removeItem` (SecureStore, `localStorage`,
AsyncStorage…).

```ts
import type { ChatSessionStorage } from '@thinhnguyenvn/chat-core'

const storage: ChatSessionStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}
```

Keys only contain `[A-Za-z0-9._-]` (other characters become `_`), so SecureStore accepts them.

## API

| Export | Kind |
|--|--|
| `useConversation`, `UseConversationOptions`, `UseConversationResult` | hook |
| `conversationReducer`, `initialConversationState`, `ConversationState`, `ConversationAction` | state |
| `ChatAdapter`, `ChatRequest`, `ChatStreamHandlers` | adapter interface |
| `createHttpChatAdapter`, `HttpChatAdapterOptions`, `ChatSessionScope`, `ChatSessionStorage` | HTTP adapter |
| `MockChatAdapter` | scripted demo adapter |
| `generateMessageId`, `localMediaUris` | util |
| `ChatMessage` and its kinds, `ConversationEvent`, `CardLockState`, `CARD_LOCK_STATES`… | types |

## Contract fixtures

`contract/` is a copy of the gateway's wire fixtures (`my-agent-platform/contract/`); the
package tests parse every stream in it. See `contract/README.md`.

## Versions

`0.x` until the platform tags `platform-v1.0.0`, then `1.0.0`. From `1.0.0`: a new event or
option that older clients can ignore is a minor; a breaking API change is a major. The wire
contract version (`X-Chat-Contract`) is separate from the package version.

| Package | Chat contract (`X-Chat-Contract`) |
|--|--|
| `0.1.x` | `1`, `2` (plus optional `X-Chat-Session`) |
| `0.2.x` | `1`, `2`, `3` (media: `POST /media`, `send_media`, `media_choice`, `select_media`) |

See `CHANGELOG.md`.
