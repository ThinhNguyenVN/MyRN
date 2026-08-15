import React, { forwardRef } from 'react'
import { Platform, ScrollView } from 'react-native'
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewRef,
  KeyboardToolbar,
} from 'react-native-keyboard-controller'

import { useTheme } from '@/theme/theme-context'

import type { MyKeyboardAvoidingScrollViewProps, MyKeyboardAvoidingScrollViewRef } from './types'

function Toolbar() {
  const { insets } = useTheme()

  if (Platform.OS === 'web') {
    return null
  }

  return (
    <KeyboardToolbar
      insets={{
        left: insets.left ?? 0,
        right: insets.right ?? 0,
      }}
    />
  )
}

const ScrollViewComponent = forwardRef<
  MyKeyboardAvoidingScrollViewRef,
  MyKeyboardAvoidingScrollViewProps
>(function MyKeyboardAvoidingScrollView({ showToolbar = false, ...rest }, ref) {
  if (Platform.OS === 'web') {
    return <ScrollView ref={ref as React.RefObject<ScrollView>} {...rest} />
  }

  return (
    <>
      <KeyboardAwareScrollView
        ref={ref as React.RefObject<KeyboardAwareScrollViewRef>}
        keyboardShouldPersistTaps="always"
        bottomOffset={100}
        {...rest}
      />
      {showToolbar ? <Toolbar /> : null}
    </>
  )
})

export const MyKeyboardAvoiding = {
  ScrollView: ScrollViewComponent,
  Toolbar,
}
