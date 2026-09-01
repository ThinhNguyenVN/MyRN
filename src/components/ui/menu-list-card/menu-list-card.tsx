import { memo } from 'react'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MenuListCardProps } from './type'

function MenuListCardInner({ items, title, showChevron = true }: MenuListCardProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <MyView style={styles.section}>
      {title ? (
        <MyText typography="label" color="text/inactive/primary" style={styles.sectionLabel}>
          {title}
        </MyText>
      ) : null}
      <MyView style={styles.card}>
        {items.map((item, index) => (
          <MyPressable
            key={item.key}
            onPress={item.onPress}
            style={[styles.row, index === items.length - 1 ? styles.rowLast : null]}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <MyIcon name={item.icon} size={20} color="icon/active/primary" />
            <MyText typography="body" style={styles.rowLabel}>
              {item.label}
            </MyText>
            {showChevron ? (
              <MyIcon name="chevron-forward" size={18} color="icon/inactive/primary" />
            ) : null}
          </MyPressable>
        ))}
      </MyView>
    </MyView>
  )
}

export const MenuListCard = memo(MenuListCardInner)
