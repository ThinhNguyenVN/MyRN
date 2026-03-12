import React, { forwardRef, useCallback, useRef, useState } from 'react'
import { Dimensions, Platform, ScrollView, View } from 'react-native'
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewRef,
  KeyboardProvider,
  KeyboardToolbar,
} from 'react-native-keyboard-controller'

import { useTheme } from '@/theme/theme-context'

import { styles } from './styles'
import type { MyKeyboardAvoidingScrollViewProps, MyKeyboardAvoidingScrollViewRef } from './types'

const ScrollViewComponent = forwardRef<
  MyKeyboardAvoidingScrollViewRef,
  MyKeyboardAvoidingScrollViewProps
>(function MyKeyboardAvoidingScrollView({ showToolbar = false, ...rest }, ref) {
  const { insets } = useTheme()
  const keyboardContainerRef = useRef<View>(null)
  const [toolbarBottomOffset, setToolbarBottomOffset] = useState(0)

  const measureToolbarOffset = useCallback(() => {
    keyboardContainerRef.current?.measureInWindow((_x, y, _w, h) => {
      const windowHeight = Dimensions.get('window').height
      const containerBottom = y + h
      setToolbarBottomOffset(Math.max(0, windowHeight - containerBottom))
    })
  }, [])

  if (Platform.OS === 'web') {
    return <ScrollView ref={ref as React.RefObject<ScrollView>} {...rest} />
  }

  const content = (
    <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
      <KeyboardAwareScrollView
        ref={ref as React.RefObject<KeyboardAwareScrollViewRef>}
        keyboardShouldPersistTaps="handled"
        bottomOffset={100}
        {...rest}
      />
      {showToolbar && (
        <KeyboardToolbar
          insets={{
            left: insets.left ?? 0,
            right: insets.right ?? 0,
          }}
          offset={{ opened: toolbarBottomOffset }}
        />
      )}
    </KeyboardProvider>
  )

  if (!showToolbar) {
    return content
  }

  return (
    <View ref={keyboardContainerRef} style={styles.container} onLayout={measureToolbarOffset}>
      {content}
    </View>
  )
})

export const MyKeyboardAvoiding = {
  ScrollView: ScrollViewComponent,
}
