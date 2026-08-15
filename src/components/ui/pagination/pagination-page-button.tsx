import { memo, useCallback } from 'react'

import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { PaginationPageButtonProps } from './type'

function PaginationPageButtonComponent({ pageNumber, active, onPress }: PaginationPageButtonProps) {
  const styles = useThemedStyles(generateStyles)

  const handlePress = useCallback(() => {
    onPress(pageNumber)
  }, [onPress, pageNumber])

  return (
    <MyPressable
      style={[styles.pageBtn, active ? styles.pageBtnActive : null]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={String(pageNumber)}
    >
      <MyText typography="caption" style={[styles.pageText, active ? styles.pageTextActive : null]}>
        {pageNumber}
      </MyText>
    </MyPressable>
  )
}

export const PaginationPageButton = memo(PaginationPageButtonComponent)
