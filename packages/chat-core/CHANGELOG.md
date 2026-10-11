# Changelog

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
