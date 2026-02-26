export const flexAlignMap = {
  start: 'flex-start' as const,
  end: 'flex-end' as const,
  center: 'center' as const,
  between: 'space-between' as const,
  around: 'space-around' as const,
  evenly: 'space-evenly' as const,
}

export type FlexAlignKey = keyof typeof flexAlignMap

export interface ContainerStyleProps {
  margin?: number
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number
  padding?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  position?: 'absolute' | 'relative'
  top?: number
  left?: number
  right?: number
  bottom?: number
  flexHorizontal?: FlexAlignKey
  flexVertical?: FlexAlignKey
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  flexGrow?: number
  flexShrink?: number
  flexBasis?: number
  flex?: number
  gap?: number
  width?: number
  height?: number
  justifyContent?: FlexAlignKey
  alignItems?: FlexAlignKey
  alignSelf?: FlexAlignKey
  alignContent?: FlexAlignKey
}
