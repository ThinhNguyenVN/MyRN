# Chat contract fixtures

Examples of what a client sends to `POST /chat` and what the gateway streams back, by contract
version. They are the **source of truth** for the wire shapes: the gateway is the side that emits
events, so it defines and checks them; the client package `@thinhnguyenvn/chat-core` (MyRN
`packages/chat-core/`) keeps a **copy** of this folder in `packages/chat-core/contract/` and parses
it with its own `consumeNdjsonBuffer`; apps using the package keep no copy (the contract is kept
by hand, no package is shared between the gateway and MyRN; spec `ndjson-chat-contract`).

| Folder | What it holds |
|--|--|
| `v1/requests/` | A request body per event the gateway acts on |
| `v1/streams/` | NDJSON streams as a client on v1 (or sending no `X-Chat-Contract`) receives them |
| `v2/streams/` | The streams that differ for a client on v2: they carry `card_state` |
| `v3/requests/`, `v3/streams/` | Media (M17): `send_media`, `select_media`, the `media_choice` card, thumbnails on `confirmation` |

## Reading a stream

One JSON object per line. In the files, ids the gateway generates are written `<id>` and
`createdAt` is `0`; the tests replace the real values before comparing. Ids a client chose
(`gone-card`, `cancelled-card`) are kept as they are.

## Contract versions

- **v1:** what MyChat did before versions existed: `chunk`, `message`, `error`, `done`.
- **v2:** v1 plus the `card_state` event (`cancelled`, `superseded`, `expired`), the optional
  `changedFields` on `confirmation` and `options` messages, and the `X-Locale` header. Sent only
  to a client that declared `X-Chat-Contract: 2` or higher.

## Changing a fixture

A change to the shape of an event changes its fixture in the same PR; the gateway tests fail if
the gateway emits something other than the fixture. Then copy the folder to MyRN
`packages/chat-core/contract/` and make its parse test pass there too.

## Cards across turns (M9)

When the user types while a card is open, the card does not wait for its 10 minutes:

- **A revision** ("tag it home"): the new card comes first, with `changedFields` naming the rows
  that changed, then `card_state: superseded` for the old one (`v2/streams/revised-card.ndjson`).
- **Another request**: `card_state: cancelled` for the open card, then the new answer
  (`v2/streams/card-replaced-by-request.ndjson`).
- **A missing field**: a `form` message built from the tool's schema (`v1/streams/form-card.ndjson`);
  the client answers with `submit_form` (`v1/requests/submit_form.json`).

A tap on a superseded card gets a sentence and, on v2, `card_state: superseded`.

## Agent loop (M9 phase 2)

- **`status`** (v2 only, like `card_state`): `{ type, messageId, text }` while the assistant works
  ("đang lấy dữ liệu…"). Show it as a transient line; the next `status`, message or `done` replaces it.
- **Words before cards (change e1-fixes):** the model's words come first, as `chunk`s of the
  turn's main message; the cards the turn read follow, each a complete `message` with its own id,
  then `done` (`v2/streams/card-replaced-by-request.ndjson`). A turn with no words (the model only
  called a tool, failed, or ran out of time, or a tap) shows its cards as they come, the first one
  on the main id. Only the last step of one question shows: a read the model retried in the same
  turn, or one that found nothing, is not drawn. Same events and shapes on every version, only the
  order changed.
- **Handoff:** a `result` card whose action is `{ type: 'external_link', label, url }`, for a step
  outside the chat such as paying (`v1/streams/handoff-card.ndjson`).

## Session

Optional, and not tied to a contract version. A client that wants the server to keep the
conversation sends `X-Chat-Session` on `POST /chat`, `POST /session/end`, and `DELETE /session`.

| Value | Meaning |
|--|--|
| header absent | Same as before sessions existed: the prompt uses `history`, nothing is stored, `done` has no `sessionId` |
| `new`, or anything that is not a UUID | Start a session. A UUID that is unknown, expired, or belongs to someone else does the same, and the response does not say which |
| a UUID this gateway returned | Continue that session |

The response of `POST /chat` repeats the id in the `X-Chat-Session` header and in `done.sessionId`
(both v1 and v2). `done.sessionId` is there because a streaming `fetch` on React Native may not
expose response headers. Clients that do not use sessions never see the field. See
`plain-answer-session.ndjson`.

`POST /session/end` with the header summarizes that session and does not end it. Without the
header it still summarizes `history`.

| Method | Path | Effect |
|--|--|
| `DELETE` | `/session` | Deletes the session named by the header. `204` when the header is missing or the id is not this user's |
| `DELETE` | `/sessions` | Deletes every session of this user in this app. Always `204` |

## Media (contract v3, M17)

Sent only to a client that declared `X-Chat-Contract: 3`. A client on v1 or v2 that sends
`send_media` or `select_media` gets the `event.unsupported` sentence; `send_images` keeps that answer
on every version (a file URI on the phone means nothing to the server).

**Upload first.** `POST /media`, multipart field `file`, same headers as `/chat` (auth, `X-App-Id`)
plus `X-Chat-Session` (required: missing is `400`; `new` starts a session). The type is read from
the file's bytes: JPEG, PNG, WebP, HEIC; anything else, video included, is `415`; over 5 MB is `413`.

```json
{ "id": "<id>", "kind": "image", "mimeType": "image/jpeg", "size": 183204, "sessionId": "<id>" }
```

Keep `sessionId` like `done.sessionId` (it is also in the `X-Chat-Session` response header) and
send it on the `/chat` that follows. `GET /media/:id` with the same headers returns the file to its
owner's session for 24h; every other case is `404`.

| Request event | Shape |
|--|--|
| `send_media` | `{ type: 'send_media', media: { id, kind: 'image' \| 'video' }[] (1..5), caption?: string }` (`v3/requests/send_media.json`) |
| `select_media` | `{ type: 'select_media', messageId, mediaIds: string[] }`, within the card's `min`..`max` (`v3/requests/select_media.json`) |

| Message | Shape |
|--|--|
| `media_choice` | `{ id, role: 'assistant', kind: 'media_choice', status: 'complete', createdAt, prompt, media: string[], min, max }`: more files were sent than the tool takes; pick `min` to `max` of them (`min` may be 0: send none). Answer with `select_media` (`v3/streams/media-choice.ndjson`) |
| `confirmation` | v3 adds `media?: string[]`: thumbnails of the files the write will use (`v3/streams/photo-confirmation.ndjson`, `media-picked.ndjson`). In `changedFields`, the entry `media` means the thumbnails changed (a new photo replaced the old one) |

- An id that is not this user's and session's, or expired, is answered with the `media.not_found`
  sentence and the model is not called (`v3/streams/media-not-found.ndjson`).
- A pick outside the card's rules gets a sentence and the card stays open; a pick on a card that
  was replaced gets `card.superseded` with `card_state`, like any card.
- Sending new files while a confirmation for a tool that takes them is open (no caption) redoes the
  card with them: new card with `changedFields: ['media']`, then `card_state: superseded` for the old one.

## Copy in MyRN

`packages/chat-core/contract/` is a copy of `my-agent-platform/contract/` taken on 2026-10-14 with
the gateway change `e1-fixes` (words before cards, not committed yet in the gateway). Do not edit it
here: change the gateway fixture, then copy the folder again and update this line.
