import React, { useCallback, useMemo, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
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
import MyView from '@/components/elements/my-view'

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

function getInitialRows(t: (k: string, options?: Record<string, unknown>) => string): DemoRow[] {
  return [
    {
      id: '1',
      title: t('playground.swipeDemoTitleBoth'),
      caption: t('playground.swipeDemoCaptionBoth'),
      swipeToRemove: 'both',
      left: [
        {
          icon: 'archive-outline',
          type: 'secondary',
          onPress: () => Alert.alert(t('playground.swipeActionArchive')),
        },
        {
          icon: 'trash-outline',
          type: 'tertiary',
          onPress: () => Alert.alert(t('playground.swipeActionTrash')),
        },
      ],
      right: [
        {
          icon: 'mail-unread-outline',
          type: 'secondary',
          onPress: () => Alert.alert(t('playground.swipeActionUnread')),
        },
        {
          icon: 'flag-outline',
          type: 'primary',
          onPress: () => Alert.alert(t('playground.swipeActionFlag')),
        },
      ],
    },
    {
      id: '2',
      title: t('playground.swipeDemoTitleRightMenu'),
      caption: t('playground.swipeDemoCaptionRightMenu'),
      swipeToRemove: 'left',
      left: [],
      right: [
        {
          icon: 'add-circle',
          type: 'secondary',
          onPress: () => Alert.alert(t('playground.swipeActionReply')),
        },
        {
          icon: 'trash-outline',
          type: 'tertiary',
          onPress: () => Alert.alert(t('playground.swipeActionTrash')),
        },
      ],
    },
    {
      id: '3',
      title: t('playground.swipeDemoTitleLeftMenu'),
      caption: t('playground.swipeDemoCaptionLeftMenu'),
      swipeToRemove: 'right',
      left: [
        {
          icon: 'folder-outline',
          type: 'secondary',
          onPress: () => Alert.alert(t('playground.swipeActionMove')),
        },
      ],
      right: [],
    },
  ]
}

function localStyles(theme: ThemeType) {
  const { getSpacing, getColor } = theme
  return StyleSheet.create({
    screen: { flex: 1 },
    list: { flex: 1 },
    rowCard: {
      backgroundColor: getColor('fill/background/primary'),
      padding: getSpacing('x3'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/secondary'),
    },

    captionMargin: { marginTop: getSpacing('x2') },
  })
}

function SwipeableItemListBody() {
  const base = useThemedStyles(generateStyles)
  const styles = useThemedStyles(localStyles)
  const { t } = useTranslation()
  const [rows, setRows] = useState<DemoRow[]>(() => getInitialRows(t))

  const remove = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: makeId(),
        title: t('playground.swipeNewRowTitle', { index: prev.length + 1 }),
        caption: t('playground.swipeNewRowCaption'),
        left: [
          {
            icon: 'star-outline',
            type: 'light',
            onPress: () => Alert.alert(t('playground.swipeActionStar')),
          },
        ],
        right: [
          {
            icon: 'trash-outline',
            type: 'tertiary',
            onPress: () => Alert.alert(t('playground.swipeActionTrash')),
          },
        ],
        swipeToRemove: 'left',
      },
    ])
  }, [t])

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<DemoRow>) => (
      <SwipeableItem
        rowKey={item.id}
        leftActions={item.left}
        rightActions={item.right}
        swipeToRemove={item.swipeToRemove}
        onDelete={() => remove(item.id)}
      >
        <MyView style={styles.rowCard} elevation={'soft/down/small'} radius="small">
          <MyText typography="body">{item.title}</MyText>
          <MyText typography="caption" color="text/active/tertiary" style={styles.captionMargin}>
            {item.caption}
          </MyText>
        </MyView>
      </SwipeableItem>
    ),
    [styles.captionMargin, styles.rowCard, remove],
  )

  const header = useMemo(
    () => (
      <MyView height={48}>
        <MyButton text={t('playground.swipeAddRow')} onPress={addRow} />
      </MyView>
    ),
    [addRow, t],
  )

  return (
    <View style={styles.screen}>
      <MyList<DemoRow>
        style={styles.list}
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
