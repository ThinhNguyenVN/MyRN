import { PropsWithChildren, useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const theme = useColorScheme() ?? 'light'
  const chevronStyle = useMemo(
    () => ({ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }) as const,
    [isOpen],
  )

  return (
    <MyView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={chevronStyle}
        />

        <MyText typography="label">{title}</MyText>
      </TouchableOpacity>
      {isOpen && <MyView style={styles.content}>{children}</MyView>}
    </MyView>
  )
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
})
