import React, { createContext, useCallback, useRef } from 'react'
import {
  findNodeHandle,
  Platform,
  type StyleProp,
  UIManager,
  View,
  type ViewStyle,
} from 'react-native'

const SCROLL_PADDING = 80

type ViewRef = View | null

export interface FormScrollContextValue {
  registerFieldRef: (name: string, view: ViewRef) => void
  unregisterFieldRef: (name: string) => void
  scrollToField: (name: string) => void
}

const noop = () => {}
const defaultContext: FormScrollContextValue = {
  registerFieldRef: noop,
  unregisterFieldRef: noop,
  scrollToField: noop,
}

export const FormScrollContext = createContext<FormScrollContextValue>(defaultContext)

export interface FormScrollProviderProps {
  scrollViewRef: React.RefObject<{
    scrollTo: (opts: { y: number; animated?: boolean }) => void
  } | null>
  containerStyle?: StyleProp<ViewStyle>
  scrollPadding?: number
  children: ((scrollToField: (name: string) => void) => React.ReactNode) | React.ReactNode
}

export function FormScrollProvider({
  scrollViewRef,
  containerStyle,
  scrollPadding = SCROLL_PADDING,
  children,
}: FormScrollProviderProps) {
  const fieldRefsMap = useRef<Record<string, ViewRef>>({})
  const scrollContentRef = useRef<View | null>(null)

  const registerFieldRef = useCallback((name: string, view: ViewRef) => {
    fieldRefsMap.current[name] = view
  }, [])

  const unregisterFieldRef = useCallback((name: string) => {
    delete fieldRefsMap.current[name]
  }, [])

  const scrollToField = useCallback(
    (name: string) => {
      const run = () => {
        const view = fieldRefsMap.current[name]
        const scrollView = scrollViewRef?.current
        const contentView = scrollContentRef?.current
        if (!view || !scrollView || !contentView) return

        if (Platform.OS === 'web') {
          const el = view as unknown as {
            scrollIntoView?: (opts?: { block?: string; behavior?: string }) => void
          }
          if (el?.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'smooth' })
          return
        }

        const viewNode = findNodeHandle(view)
        const contentNode = findNodeHandle(contentView)
        if (viewNode === null || contentNode === null) return

        UIManager.measureLayout(
          viewNode,
          contentNode,
          () => {},
          (_x, y) => {
            scrollView.scrollTo({ y: Math.max(0, y - scrollPadding), animated: true })
          },
        )
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(run)
      })
    },
    [scrollViewRef, scrollPadding],
  )

  const value: FormScrollContextValue = {
    registerFieldRef,
    unregisterFieldRef,
    scrollToField,
  }

  const content = typeof children === 'function' ? children(scrollToField) : children

  return (
    <FormScrollContext.Provider value={value}>
      <View ref={scrollContentRef} collapsable={false} style={containerStyle}>
        {content}
      </View>
    </FormScrollContext.Provider>
  )
}

export function useFormScrollContext(): FormScrollContextValue {
  return React.useContext(FormScrollContext) ?? defaultContext
}
