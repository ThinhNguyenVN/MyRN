import { memo } from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { ImagePickerField } from './image-picker-field'
import { generateStyles } from './styles'
import type { ImageThumbnailRowProps } from './type'

/**
 * Square thumbnail on the left, title + hints + error on the right. Same layout on mobile and
 * desktop (the text column shrinks), so every upload section looks alike.
 */
function ImageThumbnailRowInner({
  title,
  hint,
  note,
  errorMessage,
  ...pickerProps
}: ImageThumbnailRowProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <MyView style={styles.thumbnailRow}>
      <ImagePickerField {...pickerProps} />
      <MyView style={styles.thumbnailRowText}>
        <ConditionRenderer when={Boolean(title)}>
          <MyText typography="h3">{title}</MyText>
        </ConditionRenderer>
        <ConditionRenderer when={Boolean(hint)}>
          <MyText typography="caption" style={styles.rowHint}>
            {hint}
          </MyText>
        </ConditionRenderer>
        <ConditionRenderer when={Boolean(note)}>
          <MyText typography="caption" style={styles.rowHint}>
            {note}
          </MyText>
        </ConditionRenderer>
        <ConditionRenderer when={Boolean(errorMessage)}>
          <MyText typography="caption" style={styles.error}>
            {errorMessage}
          </MyText>
        </ConditionRenderer>
      </MyView>
    </MyView>
  )
}

export const ImageThumbnailRow = memo(ImageThumbnailRowInner)
