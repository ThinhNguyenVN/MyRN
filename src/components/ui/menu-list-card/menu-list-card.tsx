import { memo } from 'react'
import { isNil } from 'lodash'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MenuListCardProps, MenuListItem } from './type'

type MenuListRowProps = {
  item: MenuListItem
  isLast: boolean
  showChevron: boolean
  styles: ReturnType<typeof generateStyles>
}

function MenuListRowInner({ item, isLast, showChevron, styles }: MenuListRowProps) {
  const showRowChevron = showChevron && isNil(item.trailing) && !isNil(item.onPress)
  const rowStyle = [styles.row, isLast ? styles.rowLast : null]
  const content = (
    <>
      <MyIcon name={item.icon} size={20} color="icon/active/primary" />
      <MyText typography="body" style={styles.rowLabel}>
        {item.label}
      </MyText>
      {item.trailing}
      {showRowChevron ? (
        <MyIcon name="chevron-forward" size={18} color="icon/inactive/primary" />
      ) : null}
    </>
  )

  if (isNil(item.onPress)) {
    return (
      <MyView style={rowStyle} accessibilityLabel={item.label}>
        {content}
      </MyView>
    )
  }

  return (
    <MyPressable
      onPress={item.onPress}
      style={rowStyle}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      {content}
    </MyPressable>
  )
}

const MenuListRow = memo(MenuListRowInner)

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
          <MenuListRow
            key={`menu-row-${item.key}`}
            item={item}
            isLast={index === items.length - 1}
            showChevron={showChevron}
            styles={styles}
          />
        ))}
      </MyView>
    </MyView>
  )
}

export const MenuListCard = memo(MenuListCardInner)
