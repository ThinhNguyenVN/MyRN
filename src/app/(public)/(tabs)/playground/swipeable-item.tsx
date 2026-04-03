import React, { useCallback, useMemo, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import {
  SwipeableItemProvider,
  SwipeableItem,
  type SwipeableItemAction,
  type SwipeToRemoveOption,
} from '@/components/ui/swipeable-item'
import type { ThemeType } from '@/theme/theme-context'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import { ListRenderItemInfo, MyList } from '@/components/ui/my-list'

type DemoRow = {
  id: string
  title: string
  caption: string
  left: SwipeableItemAction[]
  right: SwipeableItemAction[]
  swipeToRemove?: SwipeToRemoveOption
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

const INITIAL_ROWS: DemoRow[] = [
  {
    id: '1',
    title: 'Hai phía · swipeToRemove=both',
    caption:
      'Vuốt mở hai menu; quá ngưỡng + thả xóa **cả hai hướng**. Không set prop = không vuốt xóa',
    swipeToRemove: 'both',
    left: [
      {
        icon: 'archive-outline',
        type: 'secondary',
        onPress: () => Alert.alert('Archive'),
      },
      {
        icon: 'trash-outline',
        type: 'tertiary',
        onPress: () => Alert.alert('Trash'),
      },
    ],
    right: [
      {
        icon: 'mail-unread-outline',
        type: 'secondary',
        onPress: () => Alert.alert('Unread'),
      },
      {
        icon: 'flag-outline',
        type: 'primary',
        onPress: () => Alert.alert('Flag'),
      },
    ],
  },
  {
    id: '2',
    title: 'Chỉ menu phải · swipeToRemove=left',
    caption: 'Chỉ vuốt trái (mở phải) mới xóa được; vuốt phải quá ngưỡng chỉ bung menu trái',
    swipeToRemove: 'left',
    left: [],
    right: [
      { icon: 'add-circle', type: 'secondary', onPress: () => Alert.alert('Reply') },
      { icon: 'trash-outline', type: 'tertiary', onPress: () => Alert.alert('Trash') },
    ],
  },
  {
    id: '3',
    title: 'Chỉ menu trái · swipeToRemove=right',
    caption: 'Chỉ vuốt phải (mở trái) mới xóa; vuốt trái chỉ mở folder, không commit xóa',
    swipeToRemove: 'right',
    left: [{ icon: 'folder-outline', type: 'secondary', onPress: () => Alert.alert('Move') }],
    right: [],
  },
]

function localStyles(theme: ThemeType) {
  const { getSpacing, getColor, getRadius } = theme
  return StyleSheet.create({
    screen: { flex: 1 },
    list: { flex: 1 },
    rowCard: {
      marginBottom: getSpacing('x2'),
      borderRadius: getRadius('small'),
      backgroundColor: getColor('fill/background/tertiary'),
      paddingVertical: getSpacing('x3'),
      paddingHorizontal: getSpacing('x4'),
    },
    header: { gap: getSpacing('x2'), marginBottom: getSpacing('x4') },
    captionMargin: { marginTop: getSpacing('x2') },
  })
}

function SwipeableItemListBody() {
  const base = useThemedStyles(generateStyles)
  const local = useThemedStyles(localStyles)
  const [rows, setRows] = useState<DemoRow[]>(INITIAL_ROWS)

  const remove = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: makeId(),
        title: `Dòng mới #${prev.length + 1}`,
        caption: 'Vuốt như các dòng khác',
        left: [{ icon: 'star-outline', type: 'light', onPress: () => Alert.alert('Star') }],
        right: [{ icon: 'trash-outline', type: 'tertiary', onPress: () => Alert.alert('Trash') }],
        swipeToRemove: 'left',
      },
    ])
  }, [])

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<DemoRow>) => (
      <SwipeableItem
        rowKey={item.id}
        leftActions={item.left}
        rightActions={item.right}
        swipeToRemove={item.swipeToRemove}
        onDelete={() => remove(item.id)}
      >
        <View style={local.rowCard}>
          <MyText typography="body">{item.title}</MyText>
          <MyText typography="caption" color="text/active/tertiary" style={local.captionMargin}>
            {item.caption}
          </MyText>
        </View>
      </SwipeableItem>
    ),
    [local.captionMargin, local.rowCard, remove],
  )

  const header = useMemo(
    () => (
      <MyView style={local.header}>
        <MyText typography="subtitle" style={base.sectionTitle}>
          Swipeable item
        </MyText>

        <MyButton text="Thêm dòng" size="small" type="secondary" onPress={addRow} />
      </MyView>
    ),
    [addRow, base.sectionTitle, local.header],
  )

  return (
    <View style={local.screen}>
      <MyList<DemoRow>
        style={local.list}
        data={rows}
        renderItem={renderItem}
        ListHeaderComponent={header}
        contentContainerStyle={base.screenContent}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        enableLayoutAnimated
      />
    </View>
  )
}

export default function SwipeableItemPlaygroundScreen() {
  return (
    <SwipeableItemProvider>
      <SwipeableItemListBody />
    </SwipeableItemProvider>
  )
}
