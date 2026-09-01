import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWatch } from 'react-hook-form'
import { isNil } from 'lodash'
import Animated from 'react-native-reanimated'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyFormTextInput } from '@/components/form'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles, orderLineNoteEntering, orderLineNoteExiting } from './styles'
import type { OrderFormLineNoteProps } from './type'

function OrderFormLineNoteInner({ index, disabled }: OrderFormLineNoteProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const { getColor } = useTheme()
  const productId = useWatch({ name: `items.${index}.product_id` }) as string
  const note = useWatch({ name: `items.${index}.note` }) as string | undefined
  const noteText = isNil(note) ? '' : note
  const hasNote = noteText.trim().length > 0
  const hasProduct = !isNil(productId) && productId.length > 0
  const [noteOpen, setNoteOpen] = useState(() => hasNote)
  const skipNoteEnterRef = useRef(true)

  useEffect(() => {
    skipNoteEnterRef.current = false
  }, [])

  const handleToggleNote = useCallback(() => {
    setNoteOpen((prev) => !prev)
  }, [])

  const handleOpenNote = useCallback(() => {
    setNoteOpen(true)
  }, [])

  const editIcon = useMemo(
    () => <MyIcon name="create-outline" size={18} color={getColor('brand/primary')} />,
    [getColor],
  )

  const noteField = (
    <MyFormTextInput
      name={`items.${index}.note`}
      placeholder={t('components.orderFormLine.lineNotePlaceholder')}
      disabled={disabled}
      style={styles.fieldFullInput}
    />
  )
  const hideNoteToggle = (
    <MyPressable
      style={styles.lineNoteLabelRow}
      onPress={handleToggleNote}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={t('components.orderFormLine.hideLineNote')}
    >
      <MyText typography="label" style={styles.lineNoteLinkText}>
        {t('components.orderFormLine.hideLineNote')}
      </MyText>
    </MyPressable>
  )
  const noteClosedLabel = (
    <MyText typography="label" style={styles.lineNoteLinkText}>
      {t('components.orderFormLine.addLineNote')}
    </MyText>
  )
  const noteClosedValue = (
    <MyText typography="body" numberOfLines={2} style={styles.lineNotePreviewText}>
      {noteText}
    </MyText>
  )
  const noteClosedRow = (
    <Animated.View
      key={`order-line-note-closed-${index}`}
      entering={skipNoteEnterRef.current ? undefined : orderLineNoteEntering}
      exiting={orderLineNoteExiting}
    >
      <MyPressable
        style={styles.lineNotePreview}
        onPress={handleOpenNote}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={
          hasNote
            ? t('components.orderFormLine.editLineNote')
            : t('components.orderFormLine.addLineNote')
        }
      >
        {editIcon}
        <ConditionRenderer when={hasNote} fallback={noteClosedLabel}>
          {noteClosedValue}
        </ConditionRenderer>
      </MyPressable>
    </Animated.View>
  )
  const noteOpenContent = (
    <Animated.View
      key={`order-line-note-open-${index}`}
      entering={skipNoteEnterRef.current ? undefined : orderLineNoteEntering}
      exiting={orderLineNoteExiting}
    >
      <MyView style={styles.lineNoteField}>
        {hideNoteToggle}
        {noteField}
      </MyView>
    </Animated.View>
  )
  const noteEditableChrome = (
    <MyView style={styles.lineNoteField}>
      <ConditionRenderer when={noteOpen} fallback={noteClosedRow}>
        {noteOpenContent}
      </ConditionRenderer>
    </MyView>
  )
  const showNoteChrome = hasProduct && (!disabled || hasNote)

  return (
    <ConditionRenderer when={showNoteChrome}>
      <ConditionRenderer when={disabled} fallback={noteEditableChrome}>
        {noteClosedValue}
      </ConditionRenderer>
    </ConditionRenderer>
  )
}

export const OrderFormLineNote = memo(OrderFormLineNoteInner)
