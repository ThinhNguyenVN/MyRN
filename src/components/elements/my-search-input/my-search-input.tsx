import React, { memo, useCallback, useMemo } from 'react'
import { isNil } from 'lodash'

import MyIcon from '@/components/elements/my-icon'
import MyTextInput from '@/components/elements/my-text-input'

import { shouldShowSearchClear } from './search-input-utils'
import type { MySearchInputProps } from './type'

const MySearchInput: React.FC<MySearchInputProps> = ({
  value,
  onChangeText,
  startIcon,
  endIcon,
  onEndIconPress,
  returnKeyType,
  ...rest
}) => {
  const showClear = shouldShowSearchClear(value)

  const handleClear = useCallback(() => {
    onChangeText?.('')
  }, [onChangeText])

  const resolvedStartIcon = useMemo(
    () =>
      !isNil(startIcon) ? (
        startIcon
      ) : (
        <MyIcon name="search" size={20} color="icon/active/secondary" />
      ),
    [startIcon],
  )

  const resolvedEndIcon = useMemo(() => {
    if (!isNil(endIcon)) return endIcon
    if (!showClear) return undefined
    return <MyIcon name="close-circle" size={20} color="icon/active/secondary" />
  }, [endIcon, showClear])

  const resolvedEndPress = useMemo(() => {
    if (!isNil(onEndIconPress)) return onEndIconPress
    if (showClear) return handleClear
    return undefined
  }, [handleClear, onEndIconPress, showClear])

  return (
    <MyTextInput
      {...rest}
      value={value}
      onChangeText={onChangeText}
      startIcon={resolvedStartIcon}
      endIcon={resolvedEndIcon}
      onEndIconPress={resolvedEndPress}
      returnKeyType={returnKeyType ?? 'search'}
    />
  )
}

MySearchInput.displayName = 'MySearchInput'

export default memo(MySearchInput)
