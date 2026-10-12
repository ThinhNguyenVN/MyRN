import React, { memo } from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { CONFIRMATION_MEDIA_MAX_THUMBNAILS } from './constants'
import MyChatMediaThumbnail from './my-chat-media-thumbnail'
import { generateStyles } from './styles'

export interface MyChatMediaRowProps {
  media: string[]
  /** Marks the row like a changed summary field (`changedFields` contains `'media'`). */
  isChanged?: boolean
}

/** Up to 4 thumbnails; with more, the 4th shows "+N" for the rest. */
function MyChatMediaRow({ media, isChanged = false }: MyChatMediaRowProps) {
  const styles = useThemedStyles(generateStyles)
  const overflow = media.length > CONFIRMATION_MEDIA_MAX_THUMBNAILS
  const shown = media.slice(0, CONFIRMATION_MEDIA_MAX_THUMBNAILS)
  const hiddenCount = media.length - CONFIRMATION_MEDIA_MAX_THUMBNAILS + 1

  return (
    <MyView style={styles.mediaThumbRow}>
      {isChanged ? <MyView style={styles.changedDot} /> : null}
      {shown.map((id, index) => (
        <MyView key={`chat-media-row-${id}`}>
          <MyChatMediaThumbnail mediaId={id} style={styles.cardMediaThumb} />
          {overflow && index === shown.length - 1 ? (
            <MyView style={[styles.mediaThumbFrame, styles.mediaMoreOverlay]}>
              <MyText typography="label" style={styles.mediaMoreText}>
                {`+${hiddenCount}`}
              </MyText>
            </MyView>
          ) : null}
        </MyView>
      ))}
    </MyView>
  )
}

export default memo(MyChatMediaRow)
