import React, { forwardRef, memo, useCallback, useMemo } from 'react'
import { isNil } from 'lodash'

import MyIcon from '@/components/elements/my-icon'
import MyTextInput from '@/components/elements/my-text-input'
import type { MyTextInputRef } from '@/components/elements/my-text-input/type'

import { shouldShowSearchClear } from './search-input-utils'
import type { MySearchInputProps } from './type'

const MySearchInput = memo(
  forwardRef<MyTextInputRef, MySearchInputProps>(function MySearchInput(
    { value, onChangeText, startIcon, endIcon, onEndIconPress, returnKeyType, ...rest },
    ref,
  ) {
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
      if (endIcon !== undefined) {
        return endIcon ?? undefined
      }
      if (!showClear) {
        return undefined
      }
      return <MyIcon name="close-circle" size={20} color="icon/active/secondary" />
    }, [endIcon, showClear])

    const resolvedEndPress = useMemo(() => {
      if (onEndIconPress) {
        return onEndIconPress
      }
      if (endIcon) {
        return undefined
      }
      if (showClear) {
        return handleClear
      }
      return undefined
    }, [endIcon, handleClear, onEndIconPress, showClear])

    return (
      <MyTextInput
        ref={ref}
        {...rest}
        value={value}
        onChangeText={onChangeText}
        startIcon={resolvedStartIcon}
        endIcon={resolvedEndIcon}
        onEndIconPress={resolvedEndPress}
        returnKeyType={returnKeyType ?? 'search'}
      />
    )
  }),
)

MySearchInput.displayName = 'MySearchInput'

export default MySearchInput
