import { act, fireEvent, render } from '@testing-library/react-native'
import { createRef, type ComponentType, type ReactNode } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { MyThemeProvider } from '@/theme/theme-context'

import type { MyBottomSheetProps, MyBottomSheetRef } from './type'

jest.mock('expo-constants', () => ({ __esModule: true, default: { appOwnership: null } }))
jest.mock('@expo/ui/community/bottom-sheet', () => ({
  BottomSheetModal: () => null,
  BottomSheetScrollView: () => null,
  BottomSheetView: () => null,
}))

jest.mock('react-native-gesture-handler', () => {
  const { View } = jest.requireActual('react-native')
  const chain: Record<string, unknown> = {}
  const proxy: unknown = new Proxy(chain, { get: () => () => proxy })
  return {
    Gesture: { Pan: () => proxy },
    GestureDetector: ({ children }: { children: unknown }) => children,
    GestureHandlerRootView: View,
  }
})
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native')
  return {
    __esModule: true,
    default: { View },
    Extrapolation: { CLAMP: 'clamp' },
    interpolate: () => 0,
    runOnJS: (fn: unknown) => fn,
    useAnimatedStyle: () => ({}),
    useSharedValue: (v: number) => ({ value: v }),
    withSpring: (v: number) => v,
    withTiming: (v: number) => v,
  }
})

// Wide viewport → RN Modal branch (same path as web).
jest.mock('@/hooks/dimenstions-hooks', () => ({
  ...jest.requireActual('@/hooks/dimenstions-hooks'),
  useIsMobileSize: () => false,
}))

type SheetComponent = ComponentType<MyBottomSheetProps & { ref?: React.Ref<MyBottomSheetRef> }>

/* eslint-disable @typescript-eslint/no-require-imports -- load both platform files after jest.mock */
const variants: [string, () => SheetComponent][] = [
  ['web', () => require('./my-bottom-sheet.web').default],
  ['native', () => require('./my-bottom-sheet.native').default],
]
/* eslint-enable @typescript-eslint/no-require-imports */

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 1024, height: 768 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <MyThemeProvider value="light">{children}</MyThemeProvider>
    </SafeAreaProvider>
  )
}

describe.each(variants)('MyBottomSheet %s (RN Modal branch, uncontrolled)', (_name, load) => {
  const MyBottomSheet = load()

  function setup(props: Partial<MyBottomSheetProps> = {}) {
    const ref = createRef<MyBottomSheetRef>()
    const onClosed = jest.fn()
    const onDismiss = jest.fn()
    const utils = render(
      <MyBottomSheet
        ref={ref}
        title="Sheet"
        showClose
        onClosed={onClosed}
        onDismiss={onDismiss}
        {...props}
      >
        {null}
      </MyBottomSheet>,
      { wrapper: Wrapper },
    )
    return { ref, onClosed, onDismiss, ...utils }
  }

  it('close() via ref while open calls onClosed and onDismiss once', () => {
    const { ref, onClosed, onDismiss } = setup()
    act(() => ref.current?.open())
    act(() => ref.current?.close())
    expect(onClosed).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('close() while closed calls nothing', () => {
    const { ref, onClosed, onDismiss } = setup()
    act(() => ref.current?.close())
    expect(onClosed).not.toHaveBeenCalled()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('second close() after closing does not call onClosed again', () => {
    const { ref, onClosed } = setup()
    act(() => ref.current?.open())
    act(() => ref.current?.close())
    act(() => ref.current?.close())
    expect(onClosed).toHaveBeenCalledTimes(1)
  })

  it('onClosed calling close() again does not recurse', () => {
    const ref = createRef<MyBottomSheetRef>()
    const onClosed = jest.fn(() => ref.current?.close())
    render(
      <MyBottomSheet ref={ref} title="Sheet" onClosed={onClosed}>
        {null}
      </MyBottomSheet>,
      { wrapper: Wrapper },
    )
    act(() => ref.current?.open())
    act(() => ref.current?.close())
    expect(onClosed).toHaveBeenCalledTimes(1)
  })

  it('header close button (requestClose) calls onClosed once', () => {
    const { ref, onClosed, getByRole } = setup()
    act(() => ref.current?.open())
    fireEvent.press(getByRole('button'))
    expect(onClosed).toHaveBeenCalledTimes(1)
  })

  it('controlled mode: close() ref does nothing, requestClose calls onClose only', () => {
    const onClose = jest.fn()
    const { ref, onClosed, getByRole } = setup({ visible: true, onClose })
    act(() => ref.current?.close())
    expect(onClosed).not.toHaveBeenCalled()
    fireEvent.press(getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClosed).not.toHaveBeenCalled()
  })
})
