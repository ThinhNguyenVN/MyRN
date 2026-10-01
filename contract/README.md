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

## Copy in MyRN

This folder is a copy of `my-agent-platform/contract/` at commit `8785125` (2026-10-01). Do not edit
it here: change the gateway fixture, then copy the folder again and update this line.
