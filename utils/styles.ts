import { ContainerStyleProps, flexAlignMap, FlexAlignKey } from '@/types/styles'
import { isNil } from 'lodash'
import { ViewStyle } from 'react-native'

/** Tất cả key của ContainerStyleProps — dùng để pick (build style) / omit (spread lên View). */
export const CONTAINER_STYLE_KEYS: (keyof ContainerStyleProps)[] = [
  'margin',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'padding',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'flexHorizontal',
  'flexVertical',
  'flexDirection',
  'flexWrap',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'flex',
  'gap',
  'width',
  'height',
  'justifyContent',
  'alignItems',
  'alignSelf',
  'alignContent',
]

/** Chuyển ContainerStyleProps thành ViewStyle. */
export function getContainerStyle(props: Partial<ContainerStyleProps>): ViewStyle {
  const s: ViewStyle = {}
  const map = (v: FlexAlignKey | undefined) => (v ? flexAlignMap[v] : undefined)
  if (!isNil(props.margin)) s.margin = props.margin
  if (!isNil(props.marginLeft)) s.marginLeft = props.marginLeft
  if (!isNil(props.marginRight)) s.marginRight = props.marginRight
  if (!isNil(props.marginTop)) s.marginTop = props.marginTop
  if (!isNil(props.marginBottom)) s.marginBottom = props.marginBottom
  if (!isNil(props.padding)) s.padding = props.padding
  if (!isNil(props.paddingLeft)) s.paddingLeft = props.paddingLeft
  if (!isNil(props.paddingRight)) s.paddingRight = props.paddingRight
  if (!isNil(props.paddingTop)) s.paddingTop = props.paddingTop
  if (!isNil(props.paddingBottom)) s.paddingBottom = props.paddingBottom
  if (!isNil(props.position)) s.position = props.position
  if (!isNil(props.top)) s.top = props.top
  if (!isNil(props.left)) s.left = props.left
  if (!isNil(props.right)) s.right = props.right
  if (!isNil(props.bottom)) s.bottom = props.bottom
  if (!isNil(props.flexDirection)) s.flexDirection = props.flexDirection
  if (!isNil(props.flexWrap)) s.flexWrap = props.flexWrap
  if (!isNil(props.flexGrow)) s.flexGrow = props.flexGrow
  if (!isNil(props.flexShrink)) s.flexShrink = props.flexShrink
  if (!isNil(props.flexBasis)) s.flexBasis = props.flexBasis
  if (!isNil(props.flex)) s.flex = props.flex
  if (!isNil(props.gap)) s.gap = props.gap
  if (!isNil(props.width)) s.width = props.width
  if (!isNil(props.height)) s.height = props.height
  const j = map(props.justifyContent ?? props.flexHorizontal)
  const a = map(props.alignItems ?? props.flexVertical)
  if (!isNil(j)) s.justifyContent = j as ViewStyle['justifyContent']
  if (!isNil(a)) s.alignItems = a as ViewStyle['alignItems']
  const self = map(props.alignSelf)
  if (!isNil(self)) s.alignSelf = self as ViewStyle['alignSelf']
  const content = map(props.alignContent)
  if (!isNil(content)) s.alignContent = content as ViewStyle['alignContent']
  return s
}

export function pickContainerProps<T>(props: Partial<T>): Partial<T> {
  const out: Record<string, unknown> = {}
  CONTAINER_STYLE_KEYS.forEach((key) => {
    if (!isNil(props[key as keyof T])) out[key] = props[key as keyof T]
  })
  return out as Partial<T>
}

export function omitContainerProps<T extends Record<string, unknown>>(props: T): T {
  const keysSet = new Set<string>(CONTAINER_STYLE_KEYS as unknown as string[])
  return Object.fromEntries(Object.entries(props).filter(([k]) => !keysSet.has(k))) as T
}
