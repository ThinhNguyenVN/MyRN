export type MyDividerOrientation = 'horizontal' | 'vertical'

export function resolveDividerOrientation(
  orientation: MyDividerOrientation | undefined,
): MyDividerOrientation {
  return orientation === 'vertical' ? 'vertical' : 'horizontal'
}
