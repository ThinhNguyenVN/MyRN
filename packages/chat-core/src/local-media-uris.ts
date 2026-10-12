import type { ChatMessage } from './types'

/** Map media id → URI trên máy, lấy từ tin ảnh của user (`mediaIds` cùng thứ tự với `imageUris`). */
export function localMediaUris(messages: ChatMessage[]): Map<string, string> {
  const uris = new Map<string, string>()
  for (const message of messages) {
    if (message.kind !== 'image' || !message.mediaIds) continue
    message.mediaIds.forEach((id, index) => {
      const uri = message.imageUris[index]
      if (uri) uris.set(id, uri)
    })
  }
  return uris
}
