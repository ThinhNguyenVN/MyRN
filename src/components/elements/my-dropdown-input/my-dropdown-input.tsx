import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Keyboard, Modal, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { isNil } from 'lodash'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { FlashList, type FlashListRef } from '@shopify/flash-list'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyEmptyState from '@/components/elements/my-empty-state'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MySearchInput from '@/components/elements/my-search-input'
import MyText from '@/components/elements/my-text'
import MyTextInput from '@/components/elements/my-text-input'
import type { MyTextInputRef } from '@/components/elements/my-text-input/type'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { TriggerModal } from '@/components/ui/trigger-modal'
import { isAndroid, isIos, isWeb } from '@/constants/dimensions'
import { useDebouncedValue } from '@/hooks/commons-hooks'
import { useThemedStyles } from '@/theme/theme-context'

import { DropdownOptionRow } from './dropdown-option-row'
import {
  DROPDOWN_ITEM_SIZE,
  DROPDOWN_LIST_DRAW_DISTANCE,
  DROPDOWN_MAX_HEIGHT,
  DROPDOWN_MIN_HEIGHT,
  DROPDOWN_MIN_ITEMS,
  generateStyles,
} from './styles'
import type { DropdownOption, MyDropdownInputProps } from './type'
import {
  DROPDOWN_SEARCH_DEBOUNCE_MS,
  DROPDOWN_SELECT_CLOSE_MS,
  dropdownOptionKey,
  filterDropdownOptions,
  shouldShowDropdownSearch,
  shouldUseDropdownBottomSheet,
} from './utils'

const MyDropdownInput = memo(function MyDropdownInput({
  options,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  loading = false,
  multiSelect = false,
  title,
  pickerTitle,
  subTitle,
  error = false,
  errorMessage,
  required = false,
  allowClear: allowClearProp,
  searchable: searchableProp,
  preferSheet = false,
  style,
}: MyDropdownInputProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const isNative = isIos || isAndroid
  const triggerInputRef = useRef<MyTextInputRef>(null)
  const mobileSearchRef = useRef<MyTextInputRef>(null)
  const sheetRef = useRef<MyBottomSheetRef>(null)
  const [open, setOpen] = useState(false)
  const [lockedIsSheet, setLockedIsSheet] = useState<boolean | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const closeAfterSelectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerLayoutRef = useRef<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const debouncedSearchQuery = useDebouncedValue(searchQuery, DROPDOWN_SEARCH_DEBOUNCE_MS)
  const filterQuery = searchQuery.trim() === '' ? '' : debouncedSearchQuery
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const resolvedPlaceholder = placeholder ?? t('components.dropdownSelect')
  const hasOptions = options.length > 0
  const isWaiting = loading || !hasOptions
  const isPickerDisabled = disabled || isWaiting
  const waitPlaceholder = loading ? t('components.dropdownLoading') : t('components.dropdownEmpty')
  const searchable = searchableProp ?? shouldShowDropdownSearch(options.length)
  const liveIsSheet = preferSheet || shouldUseDropdownBottomSheet(options.length)
  const useSheet = isNative && (lockedIsSheet ?? liveIsSheet)
  const allowClear = allowClearProp ?? !required

  const selectedValues = useMemo<string[]>(
    () =>
      multiSelect
        ? Array.isArray(value)
          ? value
          : !isNil(value) && value !== ''
            ? [value as string]
            : []
        : !isNil(value) && value !== ''
          ? [value as string]
          : [],
    [multiSelect, value],
  )

  const selectedOption = !multiSelect ? options.find((option) => option.value === value) : null
  const displayText = multiSelect
    ? selectedValues
        .map((selected) => options.find((option) => option.value === selected)?.label)
        .filter(Boolean)
        .join(', ') || resolvedPlaceholder
    : (selectedOption?.label ?? resolvedPlaceholder)

  const filteredOptions = useMemo(
    () => filterDropdownOptions(options, filterQuery),
    [filterQuery, options],
  )

  const triggerRef = useRef<View>(null)
  const flashListRef = useRef<FlashListRef<DropdownOption>>(null)
  const webListRef = useRef<FlatList<DropdownOption>>(null)
  const chevronRotation = useSharedValue(0)

  const pickerHeading = pickerTitle ?? title ?? t('components.wheelSelect')

  const selectedIndex = useMemo(() => {
    if (multiSelect) {
      if (selectedValues.length === 0) {
        return -1
      }
      const lastValue = selectedValues[selectedValues.length - 1]
      return filteredOptions.findIndex((option) => option.value === lastValue)
    }
    if (isNil(value) || value === '') {
      return -1
    }
    return filteredOptions.findIndex((option) => option.value === value)
  }, [filteredOptions, multiSelect, selectedValues, value])

  useEffect(() => {
    chevronRotation.value = withTiming(open ? -90 : 0)
  }, [open, chevronRotation])

  useEffect(() => {
    if (!open || !searchable || !isWeb) {
      return
    }
    const timer = setTimeout(() => {
      mobileSearchRef.current?.focus()
    }, 80)
    return () => clearTimeout(timer)
  }, [open, searchable])

  const skipDismissRef = useRef(false)

  useEffect(() => {
    if (!open || !isNative || useSheet) {
      return
    }
    skipDismissRef.current = true
    const timer = setTimeout(() => {
      skipDismissRef.current = false
    }, 500)
    return () => clearTimeout(timer)
  }, [isNative, open, options.length, useSheet])

  useEffect(() => {
    if (!useSheet) {
      return
    }
    if (open) {
      sheetRef.current?.open()
    }
  }, [open, useSheet])

  useEffect(() => {
    if (!isWaiting || !open) {
      return
    }
    setOpen(false)
  }, [isWaiting, open])

  useEffect(() => {
    return () => {
      if (closeAfterSelectRef.current) {
        clearTimeout(closeAfterSelectRef.current)
      }
    }
  }, [])

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }))

  const captureTriggerLayout = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const next = { x, y, width, height }
      triggerLayoutRef.current = next
      setTriggerLayout(next)
    },
    [],
  )

  const measureTrigger = useCallback(() => {
    triggerRef.current?.measureInWindow(captureTriggerLayout)
  }, [captureTriggerLayout])

  const openPicker = useCallback(() => {
    if (isPickerDisabled) {
      return
    }
    setSearchQuery('')
    if (isNative) {
      setLockedIsSheet(liveIsSheet)
      setOpen(true)
      return
    }
    measureTrigger()
    if (triggerLayoutRef.current) {
      setOpen(true)
      return
    }
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      captureTriggerLayout(x, y, width, height)
      setOpen(true)
    })
  }, [captureTriggerLayout, isNative, isPickerDisabled, liveIsSheet, measureTrigger])

  const closePicker = useCallback(() => {
    if (closeAfterSelectRef.current) {
      clearTimeout(closeAfterSelectRef.current)
      closeAfterSelectRef.current = null
    }
    skipDismissRef.current = false
    mobileSearchRef.current?.blur()
    triggerInputRef.current?.blur()
    Keyboard.dismiss()
    setSearchQuery('')
    sheetRef.current?.close()
    setLockedIsSheet(null)
    setOpen(false)
  }, [])

  const handleNativeDismiss = useCallback(() => {
    if (skipDismissRef.current) {
      setOpen(false)
      requestAnimationFrame(() => {
        setOpen(true)
      })
      return
    }
    closePicker()
  }, [closePicker])

  const handleTriggerPressIn = useCallback(() => {
    if (!isNative || isPickerDisabled) {
      return
    }
    openPicker()
  }, [isNative, isPickerDisabled, openPicker])

  const clearValue = useCallback(() => {
    if (multiSelect) {
      onValueChange?.([])
      return
    }
    onValueChange?.('')
  }, [multiSelect, onValueChange])

  const handleTriggerClear = useCallback(() => {
    clearValue()
  }, [clearValue])

  const handlePickerClear = useCallback(() => {
    clearValue()
    closePicker()
  }, [clearValue, closePicker])

  const toggleOrSelect = useCallback(
    (optionValue: string) => {
      if (multiSelect) {
        const next = selectedValues.includes(optionValue)
          ? selectedValues.filter((selected) => selected !== optionValue)
          : [...selectedValues, optionValue]
        onValueChange?.(next)
        return
      }
      onValueChange?.(optionValue)
      if (closeAfterSelectRef.current) {
        clearTimeout(closeAfterSelectRef.current)
      }
      closeAfterSelectRef.current = setTimeout(() => {
        closePicker()
        closeAfterSelectRef.current = null
      }, DROPDOWN_SELECT_CLOSE_MS)
    },
    [closePicker, multiSelect, onValueChange, selectedValues],
  )

  const renderOption = useCallback(
    ({ item }: { item: DropdownOption }) => (
      <DropdownOptionRow
        option={item}
        selected={selectedValues.includes(item.value)}
        multiSelect={multiSelect}
        onSelect={toggleOrSelect}
      />
    ),
    [multiSelect, selectedValues, toggleOrSelect],
  )

  const getOptionItemLayout = useCallback((_data: unknown, index: number) => {
    return {
      length: DROPDOWN_ITEM_SIZE,
      offset: DROPDOWN_ITEM_SIZE * index,
      index,
    }
  }, [])

  const triggerChevron = (
    <Animated.View style={chevronAnimatedStyle}>
      <MyIcon name="chevron-down" size={20} color="icon/active/primary" />
    </Animated.View>
  )
  const triggerClearIcon = <MyIcon name="close-circle" size={20} color="icon/active/secondary" />
  const hasSelection = selectedValues.length > 0
  const showTriggerClear = allowClear && hasSelection && !isPickerDisabled
  const showPickerClear = allowClear && hasSelection && filterQuery === ''

  const clearSelectionRow = useMemo(
    () => (
      <MyPressable
        onPress={handlePickerClear}
        haptic={false}
        accessibilityRole="button"
        accessibilityLabel={t('components.dropdownClear')}
        style={styles.clearRow}
      >
        <MyText typography="body" style={styles.clearRowText}>
          {t('components.dropdownClear')}
        </MyText>
      </MyPressable>
    ),
    [handlePickerClear, styles.clearRow, styles.clearRowText, t],
  )

  const trigger = (
    <View ref={triggerRef} collapsable={false} style={styles.triggerWrap} onLayout={measureTrigger}>
      <MyPressable
        onPress={openPicker}
        onPressIn={handleTriggerPressIn}
        disabled={isPickerDisabled}
        haptic={false}
        animatedType="opacity"
      >
        <MyView pointerEvents="none" fillParent={false}>
          <MyTextInput
            ref={triggerInputRef}
            title={title}
            subTitle={subTitle}
            value={isWaiting && !hasSelection ? '' : displayText}
            placeholder={isWaiting && !hasSelection ? waitPlaceholder : resolvedPlaceholder}
            editable={false}
            disabled={isPickerDisabled}
            error={error}
            errorMessage={errorMessage}
            required={required}
            pointerEvents="none"
            endIcon={showTriggerClear ? triggerClearIcon : triggerChevron}
            style={styles.triggerInput}
          />
        </MyView>
      </MyPressable>
      {showTriggerClear ? (
        <MyPressable
          onPress={handleTriggerClear}
          haptic={false}
          animatedType="opacity"
          accessibilityRole="button"
          accessibilityLabel={t('components.dropdownClear')}
          style={styles.triggerClearHit}
        />
      ) : null}
    </View>
  )

  const modalMaxHeigh =
    options.length > DROPDOWN_MIN_ITEMS ? DROPDOWN_MAX_HEIGHT : DROPDOWN_MIN_HEIGHT

  const modalMaxHeightStyle = useMemo(() => {
    return {
      maxHeight: modalMaxHeigh,
    }
  }, [modalMaxHeigh])

  const emptySearch = (
    <MyView style={styles.emptyWrap} fillParent={false}>
      <MyEmptyState
        title={
          filterQuery.length > 0
            ? t('components.dropdownSearchEmpty')
            : t('components.dropdownEmpty')
        }
      />
    </MyView>
  )

  const sheetOptionRows = useMemo(
    () =>
      filteredOptions.map((item, index) => (
        <DropdownOptionRow
          key={dropdownOptionKey(item, index)}
          option={item}
          selected={selectedValues.includes(item.value)}
          multiSelect={multiSelect}
          onSelect={toggleOrSelect}
        />
      )),
    [filteredOptions, multiSelect, selectedValues, toggleOrSelect],
  )

  const pickerList = (
    <ConditionRenderer
      when={isWeb}
      fallback={
        <FlashList
          ref={flashListRef}
          data={filteredOptions}
          extraData={selectedValues}
          keyExtractor={dropdownOptionKey}
          renderItem={renderOption}
          drawDistance={DROPDOWN_LIST_DRAW_DISTANCE}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={showPickerClear ? clearSelectionRow : undefined}
          ListEmptyComponent={emptySearch}
          initialScrollIndex={selectedIndex > 0 && filterQuery === '' ? selectedIndex : undefined}
          style={styles.pickerList}
          contentContainerStyle={styles.sheetListContentMobile}
        />
      }
    >
      <FlatList
        ref={webListRef}
        data={filteredOptions}
        extraData={selectedValues}
        keyExtractor={dropdownOptionKey}
        renderItem={renderOption}
        getItemLayout={getOptionItemLayout}
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={7}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={showPickerClear ? clearSelectionRow : undefined}
        ListEmptyComponent={emptySearch}
        initialScrollIndex={selectedIndex > 0 && filterQuery === '' ? selectedIndex : undefined}
        style={[styles.pickerList, modalMaxHeightStyle]}
        contentContainerStyle={styles.sheetListContent}
      />
    </ConditionRenderer>
  )

  const mobileSearchField = (
    <MyView
      style={isWeb ? [styles.searchWrap, styles.searchWrapWeb] : styles.searchWrap}
      fillParent={false}
    >
      <MySearchInput
        ref={mobileSearchRef}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('components.dropdownSearch')}
        useBottomSheetTextInput={useSheet}
      />
    </MyView>
  )

  return (
    <MyView style={[styles.container, style]}>
      <MyView style={styles.relativeWrap}>
        {trigger}

        <ConditionRenderer when={isNative && !useSheet}>
          <Modal
            visible={open}
            animationType="slide"
            presentationStyle={isIos ? 'pageSheet' : undefined}
            onRequestClose={closePicker}
            onDismiss={isIos ? handleNativeDismiss : undefined}
          >
            <MyView
              style={isAndroid ? [styles.pickerRoot, styles.pickerRootAndroid] : styles.pickerRoot}
              backgroundColor="fill/background/primary"
            >
              <KeyboardAvoidingView
                behavior="padding"
                automaticOffset
                style={styles.pickerKeyboardAvoid}
              >
                <MyView style={styles.pickerHeader} fillParent={false}>
                  <MyText typography="h3" style={styles.pickerTitle} numberOfLines={1}>
                    {pickerHeading}
                  </MyText>
                  <MyPressable
                    onPress={closePicker}
                    haptic={false}
                    animatedType="opacity"
                    accessibilityRole="button"
                    accessibilityLabel={t('common.close')}
                    style={styles.pickerCloseHit}
                  >
                    <MyIcon name="close" size={24} color="icon/active/primary" />
                  </MyPressable>
                </MyView>
                <ConditionRenderer when={searchable}>{mobileSearchField}</ConditionRenderer>
                {pickerList}
              </KeyboardAvoidingView>
            </MyView>
          </Modal>
        </ConditionRenderer>

        <ConditionRenderer when={useSheet}>
          <MyBottomSheet
            ref={sheetRef}
            title={pickerHeading}
            showClose
            pressBackdropToClose
            enableDynamicSizing={!preferSheet}
            snapPoints={preferSheet ? ['50%'] : undefined}
            onClosed={closePicker}
            contentContainerStyle={styles.sheetPickerContent}
          >
            <ConditionRenderer when={searchable}>{mobileSearchField}</ConditionRenderer>
            <ConditionRenderer when={showPickerClear}>{clearSelectionRow}</ConditionRenderer>
            <ConditionRenderer when={filteredOptions.length === 0} fallback={sheetOptionRows}>
              {emptySearch}
            </ConditionRenderer>
          </MyBottomSheet>
        </ConditionRenderer>

        <ConditionRenderer when={isWeb}>
          <TriggerModal
            visible={open}
            onClose={closePicker}
            triggerLayout={triggerLayout}
            estimatedPanelHeight={modalMaxHeigh}
            panelStyle={styles.dropdownPanel}
          >
            <ConditionRenderer when={searchable}>{mobileSearchField}</ConditionRenderer>
            {pickerList}
          </TriggerModal>
        </ConditionRenderer>
      </MyView>
    </MyView>
  )
})

MyDropdownInput.displayName = 'MyDropdownInput'

export default memo(MyDropdownInput)
