import React, { forwardRef, memo, useCallback, useState } from 'react'

import MySearchInput from '@/components/elements/my-search-input'
import type { MyTextInputRef } from '@/components/elements/my-text-input/type'

type DropdownSearchFieldProps = {
  /** Text the field starts with; later changes come from typing (remount with a new `key` to reset). */
  initialValue: string
  onChangeText: (text: string) => void
  placeholder: string
  useBottomSheetTextInput?: boolean
}

/**
 * Search field of a picker. It owns the typed text in its own state (the parent only hears about
 * changes), because the picker body renders inside a portal (`TriggerModal`) that receives props one
 * commit late: a field controlled by the parent's state got its stale value restored between
 * keystrokes, dropping characters and duplicating IME (VNI/Telex) composition.
 */
export const DropdownSearchField = memo(
  forwardRef<MyTextInputRef, DropdownSearchFieldProps>(function DropdownSearchField(
    { initialValue, onChangeText, placeholder, useBottomSheetTextInput },
    ref,
  ) {
    const [text, setText] = useState(initialValue)

    const handleChangeText = useCallback(
      (next: string) => {
        setText(next)
        onChangeText(next)
      },
      [onChangeText],
    )

    return (
      <MySearchInput
        ref={ref}
        value={text}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        useBottomSheetTextInput={useBottomSheetTextInput}
      />
    )
  }),
)
