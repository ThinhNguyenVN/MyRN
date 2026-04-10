import React, { memo } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import { MyList, type ListRenderItemInfo } from '@/components/ui/my-list'
import {
  SwipeableItem,
  SwipeableItemProvider,
  type SwipeableItemAction,
} from '@/components/ui/swipeable-item'
import type { TodoItem } from '@/features/todo/types'
import { useThemedStyles } from '@/theme/theme-context'

import { TodoListLoadingSkeleton } from './todo-list-loading-skeleton'
import { generateStyles } from './styles'

type TodoListViewProps = {
  todos: TodoItem[]
  isLoading: boolean
  isRefreshing: boolean
  onRefresh: () => void
  onEdit: (item: TodoItem) => void
  onDelete: (item: TodoItem) => void
}

function TodoListViewInner({
  todos,
  isLoading,
  isRefreshing,
  onRefresh,
  onEdit,
  onDelete,
}: TodoListViewProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const renderItem = ({ item }: ListRenderItemInfo<TodoItem>) => {
    const rightActions: SwipeableItemAction[] = [
      {
        icon: 'create-outline',
        type: 'secondary',
        onPress: () => onEdit(item),
      },
      {
        icon: 'trash-outline',
        type: 'tertiary',
        onPress: () => onDelete(item),
      },
    ]

    return (
      <SwipeableItem
        rowKey={`todo-${item.id}`}
        rightActions={rightActions}
        onDelete={() => onDelete(item)}
      >
        <View style={styles.itemCard}>
          <MyText
            typography="body"
            style={[styles.itemTitle, item.completed ? styles.itemTitleCompleted : null]}
          >
            {item.todo}
          </MyText>
          <MyText typography="caption" color="text/active/tertiary">
            {t('todo.userPrefix')}
            {item.userId} · {item.completed ? t('todo.statusCompleted') : t('todo.statusPending')}
          </MyText>
        </View>
      </SwipeableItem>
    )
  }

  return (
    <View style={styles.screen}>
      <SwipeableItemProvider>
        <MyList<TodoItem>
          data={todos}
          style={styles.screen}
          contentContainerStyle={styles.contentContainer}
          renderItem={renderItem}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
          enableLayoutAnimated
          ListEmptyComponent={
            isLoading ? (
              <TodoListLoadingSkeleton />
            ) : (
              <View style={styles.emptyWrap}>
                <MyText typography="body">{t('todo.emptyTitle')}</MyText>
                <MyText typography="caption" color="text/active/tertiary">
                  {t('todo.emptyDescription')}
                </MyText>
              </View>
            )
          }
        />
      </SwipeableItemProvider>
    </View>
  )
}

export const TodoListView = memo(TodoListViewInner)
