import React, { memo, useEffect, useState } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { ChatMediaSource } from '@thinhnguyenvn/chat-core'

import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { useMyChatMedia } from './my-chat-media-context'
import { generateStyles } from './styles'

export interface MyChatMediaThumbnailProps {
  mediaId: string
  style?: StyleProp<ViewStyle>
}

/**
 * One gateway media id as a square thumbnail: the local URI when this device sent it, else
 * `GET /media/:id` with the chat headers (expo-image sends `headers` on native and fetches them
 * into a blob URL on web). Expired or foreign ids (404) show the placeholder.
 */
function MyChatMediaThumbnail({ mediaId, style }: MyChatMediaThumbnailProps) {
  const styles = useThemedStyles(generateStyles)
  const { localUris, mediaSource } = useMyChatMedia()
  const localUri = localUris.get(mediaId)
  const [remote, setRemote] = useState<ChatMediaSource | null | undefined>(undefined)

  useEffect(() => {
    if (localUri || !mediaSource) {
      return
    }
    let active = true
    mediaSource(mediaId).then(
      (source) => active && setRemote(source),
      () => active && setRemote(null),
    )
    return () => {
      active = false
    }
  }, [localUri, mediaId, mediaSource])

  const placeholder = (
    <MyView style={styles.mediaPlaceholder}>
      <MyIcon name="image-outline" size={20} color="icon/inactive/primary" />
    </MyView>
  )
  const uri = localUri ?? remote?.uri

  return (
    <MyView style={[styles.mediaThumbFrame, style]}>
      {uri ? (
        <MyImage
          url={uri}
          headers={localUri ? undefined : remote?.headers}
          style={styles.mediaPlaceholder}
          lockAspectRatio={false}
          contentFit="cover"
          errorContent={placeholder}
        />
      ) : (
        placeholder
      )}
    </MyView>
  )
}

export default memo(MyChatMediaThumbnail)
