# Changelog

## 0.3.0

- Contract v4, the empty chat (M13). `adapter.startSession()` (HTTP adapter with
  `contractVersion >= 4`) returns the greeting and the shortcuts of the user's role, or `null`
  when the gateway has none. `useConversation().sendQuickAction(action)` sends a `run` shortcut as
  `quick_action` (its label shows as the user's message) and a `prompt` one as text. New types
  `ChatQuickAction`, `ChatSessionStart`, event `quick_action`, and `parseSessionStart`.
  Nothing changes for an app that declares a lower contract version.
- Styled result cards: `ResultMessage` gains optional `subtitle` and `icon`; each
  `ChatSummaryField` may carry `style` (`hero` | `kpi` | `section`), `trend`, `tone` and `badge`
  (new types `ChatSummaryStyle`, `ChatSummaryTrend`, `ChatTone`). Messages pass through as before,
  so a UI that ignores the fields still shows every row.

## 0.2.3

- Retry keeps the failed slot as a typing placeholder and replaces it with the new response, so
  the list no longer shrinks and jumps. `reset_for_retry` turns the failed assistant message into
  an empty `pending` text in place (`ConversationState.retryPlaceholderId`); the retried request's
  first message (`append_message` or a new `set_message`) takes that slot. If the request ends
  without any message, the placeholder is dropped (new action `drop_retry_placeholder`). `retry`
  does nothing when there is no previous request, and an adapter whose `send` resolves without
  `onDone` now still ends the turn.

## 0.2.2

- `retry(messageId)` removes the failed assistant message; the new response brings its own (fixes
  stacked typing indicators). `retry` is ignored while a request is running, and when the last
  running request finishes, any empty `pending` assistant text left over is dropped
  (`set_done` gains optional `dropTyping`).

## 0.2.1

Contract copy only (gateway change `e1-fixes`): within a turn the model's words now come before
the cards, as `chunk`s of the turn's main message, then each card as its own `message`
(`v2/streams/card-replaced-by-request.ndjson`). Same events and shapes; no code change.

## 0.2.0

Photos over the gateway (contract v3, gateway change `chat-contract-media`, M17). Additive: apps
on contract 1 or 2 and `MockChatAdapter` behave as before.

- `ChatAdapter` gains optional `contractVersion`, `uploadMedia(file)` and `mediaSource(id)`.
  `createHttpChatAdapter` sets them; the media ones exist only when `session` is set, because
  `POST /media` needs `X-Chat-Session`. Upload is multipart field `file` to `{root}/media` with
  the `/chat` headers; the returned `sessionId` is stored like `done.sessionId`. Parallel uploads
  on a new chat wait for the first one to create the session. `mediaSource` points at
  `GET {root}/media/:id` with the same headers.
- `useConversation.sendMedia(files, caption?)`: with `uploadMedia` and `contractVersion >= 3` it
  shows the photos at once (local URIs, `pending`), uploads them in parallel, sets
  `ImageMessage.mediaIds` and sends `send_media`. A failed upload marks the message `error` and
  sends nothing; `retry(messageId)` uploads only the files still missing, then sends. Otherwise it
  falls back to `send_images`.
- `useConversation.selectMedia(messageId, mediaIds)` sends `select_media`; reducer action
  `select_media` records `selectedMediaIds` once, and `card_state` locks `media_choice` cards.
- Types: `MediaChoiceMessage` (`kind: 'media_choice'`, `prompt`, `media`, `min`, `max`),
  `ConfirmationMessage.media?`, `ImageMessage.mediaIds?`, events `send_media` / `select_media`,
  `ChatMediaFile`, `ChatMediaRef`, `ChatMediaKind`, `ChatMediaSource`.
- `localMediaUris(messages)`: media id → local URI from the user's own photo messages.
- `contract/` copied again from the gateway (adds `v3/`, plus the v1/v2 streams added since).

## 0.1.0

First release: the MyChat core moved out of MyRN `src/components/ui/chat/` into this package,
with the same behaviour.

- Types, `conversationReducer`, `useConversation`, `ChatAdapter`, `createHttpChatAdapter`
  (contract v1 and v2, optional server session), `MockChatAdapter`, `generateMessageId`.
- **Breaking for apps that pass `session`:** `session` is now `{ appId, userId, storage }`; the
  app supplies the storage for the chat session id. The key is unchanged
  (`chat.session.<appId>.<userId>`), so ids saved before upgrading are still read.
- Web vs native is decided by `Platform.OS` from `react-native`.
- Gateway contract fixtures ship in `contract/`.
