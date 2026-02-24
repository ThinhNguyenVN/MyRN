import { useMemo } from 'react'

import { useTheme } from '@/theme/theme-context'

/**
 * Tạo style object từ theme (getColor, getSpacing, tokens, ...).
 * Chỉ tính lại khi theme đổi, dùng trong component để style có token.
 *
 * @example
 * const styles = useThemedStyles(({ getColor, getSpacing }) => ({
 *   container: {
 *     backgroundColor: getColor('fill/active/primary'),
 *     padding: getSpacing('x4'),
 *   },
 *   title: {
 *     color: getColor('text/active/primary'),
 *   },
 * }))
 * return <View style={styles.container}><Text style={styles.title}>Hi</Text></View>
 */
export function useThemedStyles<T>(factory: (theme: ReturnType<typeof useTheme>) => T): T {
  const theme = useTheme()
  return useMemo(() => factory(theme), [theme.themeName])
}
