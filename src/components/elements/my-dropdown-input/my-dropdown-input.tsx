import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Keyboard, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { isNil } from 'lodash'
import { useTranslation } from 'react-i18next'
import { FlashList, type FlashListRef } from '@shopify/flash-list'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyEmptyState from '@/components/elements/my-empty-state'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyTextInput from '@/components/elements/my-text-input'
import type { MyTextInputRef } from '@/components/elements/my-text-input/type'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { NativeFullscreenModal } from '@/components/ui/native-fullscreen-modal'
import { TriggerModal } from '@/components/ui/trigger-modal'
import { isAndroid, isIos, isWeb } from '@/constants/dimensions'
import { useDebouncedValue } from '@/hooks/commons-hooks'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useThemedStyles } from '@/theme/theme-context'

import { DropdownOptionRow } from './dropdown-option-row'
import { DropdownSearchField } from './dropdown-search-field'
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
  preferFullscreen = false,
  sheetHeight,
  style,
  onSearchChange,
  onEndReached,
  hasMore = false,
  loadingMore = false,
  selectedOptions,
  fetching = false,
  searchedQuery,
  onCreateOption,
}: MyDropdownInputProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const isNative = isIos || isAndroid
  /** Web mobile responsive dùng bottom sheet chồng thay vì popover (TriggerModal). */
  const isMobileSize = useIsMobileSize()
  /**
   * Native: omit → content-sized sheet.
   * Web mobile: keep a tall fixed sheet (no NativeFullscreenModal path), matching
   * pre-dynamic-sizing behavior so searchable/product pickers stay fullscreen-tall.
   */
  const resolvedSheetHeight = sheetHeight ?? (isWeb && isMobileSize ? '90%' : undefined)
  const triggerInputRef = useRef<MyTextInputRef>(null)
  const mobileSearchRef = useRef<MyTextInputRef>(null)
  const sheetRef = useRef<MyBottomSheetRef>(null)
  const [open, setOpen] = useState(false)
  const [lockedIsSheet, setLockedIsSheet] = useState<boolean | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  /** Bumped to clear the search field, which keeps its own text (see `DropdownSearchField`). */
  const [searchFieldKey, setSearchFieldKey] = useState(0)
  const resetSearch = useCallback(() => {
    setSearchQuery('')
    setSearchFieldKey((key) => key + 1)
  }, [])
  const [creating, setCreating] = useState(false)
  /** Options created from this picker; kept so the trigger label resolves before the list refetches. */
  const [createdOptions, setCreatedOptions] = useState<DropdownOption[]>([])
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

  const isRemote = Boolean(onSearchChange)
  const resolvedPlaceholder = placeholder ?? t('components.dropdownSelect')
  const hasOptions = options.length > 0
  // Remote pickers open even with an empty page: the user searches the server.
  const isWaiting = isRemote ? false : loading || !hasOptions
  const isPickerDisabled = disabled || isWaiting
  const waitPlaceholder = loading ? t('components.dropdownLoading') : t('components.dropdownEmpty')
  const searchable = isRemote ? true : (searchableProp ?? shouldShowDropdownSearch(options.length))
  // Có nên dùng sheet dựa trên nội dung/props không (chưa tính platform).
  const wantsSheetByContent =
    !preferFullscreen && (preferSheet || shouldUseDropdownBottomSheet(options.length))
  // Native tôn trọng lockedIsSheet (khoá do gesture), web-mobile thì luôn sheet.
  const nativeWantsSheet = lockedIsSheet ?? wantsSheetByContent
  const shouldUseSheet = (isNative && nativeWantsSheet) || (isWeb && isMobileSize)
  const allowClear = allowClearProp ?? !required

  // Single select: an option with value '' (e.g. "default") is a real choice, ticked when value is ''.
  const hasEmptyOption = useMemo(
    () =>
      options.some((option) => option.value === '') ||
      Boolean(selectedOptions?.some((option) => option.value === '')),
    [options, selectedOptions],
  )

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
          : value === '' && hasEmptyOption
            ? ['']
            : [],
    [multiSelect, value, hasEmptyOption],
  )

  const findOption = useCallback(
    (optionValue: unknown) =>
      options.find((option) => option.value === optionValue) ??
      selectedOptions?.find((option) => option.value === optionValue) ??
      createdOptions.find((option) => option.value === optionValue),
    [createdOptions, options, selectedOptions],
  )
  const selectedOption = !multiSelect ? findOption(value) : null
  const displayText = multiSelect
    ? selectedValues
        .map((selected) => findOption(selected)?.label)
        .filter(Boolean)
        .join(', ') || resolvedPlaceholder
    : (selectedOption?.label ?? resolvedPlaceholder)

  const filteredOptions = useMemo(
    () => (isRemote ? options : filterDropdownOptions(options, filterQuery)),
    [filterQuery, isRemote, options],
  )

  // Remote search: forward the debounced query while open; reset to '' when the picker closes.
  const lastRemoteQueryRef = useRef<string | null>(null)
  useEffect(() => {
    if (!onSearchChange) return
    const next = open ? filterQuery.trim() : ''
    if (lastRemoteQueryRef.current === next) return
    lastRemoteQueryRef.current = next
    onSearchChange(next)
  }, [filterQuery, onSearchChange, open])

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore) onEndReached?.()
  }, [hasMore, loadingMore, onEndReached])

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
    if (selectedValues.length === 0) {
      return -1
    }
    return filteredOptions.findIndex((option) => option.value === selectedValues[0])
  }, [filteredOptions, multiSelect, selectedValues])

  useEffect(() => {
    chevronRotation.value = withTiming(open ? -90 : 0)
  }, [open, chevronRotation])

  useEffect(() => {
    if (!open || !searchable || shouldUseSheet) {
      return
    }
    const timer = setTimeout(() => {
      mobileSearchRef.current?.focus()
    }, 80)
    return () => clearTimeout(timer)
  }, [open, searchable, shouldUseSheet])

  const skipDismissRef = useRef(false)

  useEffect(() => {
    if (!open || !isNative || nativeWantsSheet) {
      return
    }
    skipDismissRef.current = true
    const timer = setTimeout(() => {
      skipDismissRef.current = false
    }, 500)
    return () => clearTimeout(timer)
  }, [isNative, open, options.length, nativeWantsSheet])

  useEffect(() => {
    if (!shouldUseSheet) {
      return
    }
    if (open) {
      sheetRef.current?.open()
    }
  }, [open, shouldUseSheet])

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
    resetSearch()
    if (isNative) {
      setLockedIsSheet(wantsSheetByContent)
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
  }, [
    captureTriggerLayout,
    isNative,
    isPickerDisabled,
    wantsSheetByContent,
    measureTrigger,
    resetSearch,
  ])

  const closePicker = useCallback(() => {
    if (closeAfterSelectRef.current) {
      clearTimeout(closeAfterSelectRef.current)
      closeAfterSelectRef.current = null
    }
    skipDismissRef.current = false
    mobileSearchRef.current?.blur()
    triggerInputRef.current?.blur()
    Keyboard.dismiss()
    resetSearch()
    sheetRef.current?.close()
    setLockedIsSheet(null)
    setOpen(false)
  }, [resetSearch])

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

  const handleTriggerClear = useCallback(
    (e?: { stopPropagation?: () => void; preventDefault?: () => void }) => {
      e?.stopPropagation?.()
      e?.preventDefault?.()
      clearValue()
    },
    [clearValue],
  )

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

  // Latest toggle for the async create below: `selectedValues` may change while the POST runs.
  const toggleOrSelectRef = useRef(toggleOrSelect)
  toggleOrSelectRef.current = toggleOrSelect

  const createName = searchQuery.trim()
  // Offer "create" only once the typed text has been searched: the list belongs to exactly this
  // query (`searchedQuery` is what the remote hook last dispatched) and no fetch is in flight,
  // so an existing entry that a stale list does not show yet is not duplicated.
  const searchSettled = (searchedQuery ?? filterQuery.trim()) === createName && !fetching
  const showCreateRow =
    Boolean(onCreateOption) &&
    createName !== '' &&
    searchSettled &&
    ![...options, ...(selectedOptions ?? []), ...createdOptions].some(
      (option) => option.label.trim().toLowerCase() === createName.toLowerCase(),
    )

  const creatingRef = useRef(false)

  const handleCreate = useCallback(async () => {
    // A ref, not the `creating` state: two quick taps land before the re-render disables the row.
    if (!onCreateOption || creatingRef.current || createName === '') {
      return
    }
    creatingRef.current = true
    setCreating(true)
    try {
      const created = await onCreateOption(createName)
      if (created) {
        setCreatedOptions((prev) => [
          ...prev.filter((option) => option.value !== created.value),
          created,
        ])
        resetSearch()
        toggleOrSelectRef.current(created.value)
      }
    } finally {
      creatingRef.current = false
      setCreating(false)
    }
  }, [createName, onCreateOption, resetSearch])

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
  // '' never counts as clearable: clearing to '' is a no-op.
  const hasSelection = selectedValues.some((selected) => selected !== '')
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
        style={styles.triggerPressable}
      >
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
          endIcon={showTriggerClear ? triggerClearIcon : triggerChevron}
          onEndIconPress={showTriggerClear ? handleTriggerClear : undefined}
          style={styles.triggerInput}
        />
      </MyPressable>
    </View>
  )

  const modalMaxHeigh =
    isRemote || options.length > DROPDOWN_MIN_ITEMS ? DROPDOWN_MAX_HEIGHT : DROPDOWN_MIN_HEIGHT

  const modalMaxHeightStyle = useMemo(() => {
    return {
      maxHeight: modalMaxHeigh,
    }
  }, [modalMaxHeigh])

  const createRow = showCreateRow ? (
    <MyPressable
      onPress={handleCreate}
      haptic={false}
      accessibilityRole="button"
      accessibilityLabel={t('components.dropdownCreate', { name: createName })}
      style={styles.clearRow}
      disabled={creating}
    >
      <MyText typography="body" style={styles.createRowText}>
        {creating
          ? t('components.dropdownCreating')
          : t('components.dropdownCreate', { name: createName })}
      </MyText>
    </MyPressable>
  ) : null

  const listHeader =
    createRow || showPickerClear ? (
      <>
        {createRow}
        {showPickerClear ? clearSelectionRow : null}
      </>
    ) : undefined

  const emptySearch = (
    <MyView style={styles.emptyWrap}>
      <MyEmptyState
        title={
          loading
            ? t('components.dropdownLoading')
            : filterQuery.length > 0
              ? t('components.dropdownSearchEmpty')
              : onCreateOption
                ? t('components.dropdownCreateHint')
                : t('components.dropdownEmpty')
        }
      />
    </MyView>
  )

  const loadMoreRow = hasMore ? (
    <MyPressable
      onPress={handleEndReached}
      haptic={false}
      accessibilityRole="button"
      accessibilityLabel={t('components.dropdownLoadMore')}
      style={styles.clearRow}
      disabled={loadingMore}
    >
      <MyText typography="body" style={styles.clearRowText}>
        {loadingMore ? t('components.dropdownLoading') : t('components.dropdownLoadMore')}
      </MyText>
    </MyPressable>
  ) : null

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
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptySearch}
          ListFooterComponent={loadMoreRow}
          onEndReached={isRemote ? handleEndReached : undefined}
          onEndReachedThreshold={0.4}
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
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptySearch}
        ListFooterComponent={loadMoreRow}
        onEndReached={isRemote ? handleEndReached : undefined}
        onEndReachedThreshold={0.4}
        initialScrollIndex={selectedIndex > 0 && filterQuery === '' ? selectedIndex : undefined}
        style={[styles.pickerList, modalMaxHeightStyle]}
        contentContainerStyle={styles.sheetListContent}
      />
    </ConditionRenderer>
  )

  const mobileSearchField = (
    <MyView style={isWeb ? [styles.searchWrap, styles.searchWrapWeb] : styles.searchWrap}>
      <DropdownSearchField
        key={searchFieldKey}
        ref={mobileSearchRef}
        initialValue=""
        onChangeText={setSearchQuery}
        placeholder={t('components.dropdownSearch')}
        useBottomSheetTextInput={nativeWantsSheet}
      />
    </MyView>
  )

  return (
    <MyView style={[styles.container, style]}>
      <MyView style={styles.relativeWrap}>
        {trigger}

        <ConditionRenderer when={isNative && !nativeWantsSheet}>
          <NativeFullscreenModal
            visible={open}
            title={pickerHeading}
            presentation="pageSheet"
            onClose={closePicker}
            onDismiss={handleNativeDismiss}
          >
            <ConditionRenderer when={searchable}>{mobileSearchField}</ConditionRenderer>
            {pickerList}
          </NativeFullscreenModal>
        </ConditionRenderer>

        <ConditionRenderer when={shouldUseSheet}>
          <MyBottomSheet
            ref={sheetRef}
            title={pickerHeading}
            showClose
            pressBackdropToClose
            visible={open}
            onClose={closePicker}
            snapPoints={resolvedSheetHeight ? [resolvedSheetHeight] : undefined}
            enableDynamicSizing={!resolvedSheetHeight}
            onClosed={closePicker}
            contentContainerStyle={styles.sheetPickerContent}
          >
            <ConditionRenderer when={searchable}>{mobileSearchField}</ConditionRenderer>
            {createRow}
            <ConditionRenderer when={showPickerClear}>{clearSelectionRow}</ConditionRenderer>
            <ConditionRenderer when={filteredOptions.length === 0} fallback={sheetOptionRows}>
              {emptySearch}
            </ConditionRenderer>
            {loadMoreRow}
          </MyBottomSheet>
        </ConditionRenderer>

        <ConditionRenderer when={isWeb && !isMobileSize}>
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
