# Chat contract fixtures

Examples of what a client sends to `POST /chat` and what the gateway streams back, by contract
version. They are the **source of truth** for the wire shapes: the gateway is the side that emits
events, so it defines and checks them; MyRN **copies** this folder and parses it with its own
`consumeNdjsonBuffer` (the contract is kept by hand, there is no shared package; spec
`ndjson-chat-contract`).

| Folder         | What it holds                                                                    |
| -------------- | -------------------------------------------------------------------------------- |
| `v1/requests/` | A request body per event the gateway acts on                                     |
| `v1/streams/`  | NDJSON streams as a client on v1 (or sending no `X-Chat-Contract`) receives them |
| `v2/streams/`  | The streams that differ for a client on v2: they carry `card_state`              |

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
the gateway emits something other than the fixture. Then copy the folder to MyRN and make its
parse test pass there too. `superseded` and `changedFields` have no stream here yet: the gateway
starts sending them with the change that replaces a card (M9).

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

## Copy in MyRN

This folder is a copy of `my-agent-platform/contract/` plus the session streams from the local
`server-session` change (2026-10-06, not committed yet; the previous copy was commit `8785125`).
Do not edit it here: change the gateway fixture, then copy the folder again and update this line.
