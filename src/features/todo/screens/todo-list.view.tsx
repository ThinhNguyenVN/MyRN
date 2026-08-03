import React, { memo, useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyCard from '@/components/elements/my-card'
import MyEmptyState from '@/components/elements/my-empty-state'
import MyErrorState from '@/components/elements/my-error-state'
import MySkeleton from '@/components/elements/my-skeleton'
import MyText from '@/components/elements/my-text'
import { MyList, type ListRenderItemInfo } from '@/components/ui/my-list'
import {
  SwipeableItem,
  SwipeableItemProvider,
  type SwipeableItemAction,
} from '@/components/ui/swipeable-item'
import type { TodoItem } from '@/features/todo/types'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

type TodoListViewProps = {
  todos: TodoItem[]
  isLoading: boolean
  isError: boolean
  isRefreshing: boolean
  onRefresh: () => void
  onRetry: () => void
  onEdit: (item: TodoItem) => void
  onDelete: (item: TodoItem) => void
}

type TodoRowProps = {
  item: TodoItem
  onEdit: (item: TodoItem) => void
  onDelete: (item: TodoItem) => void
}

const TodoRow = memo(function TodoRow({ item, onEdit, onDelete }: TodoRowProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleEdit = useCallback(() => {
    onEdit(item)
  }, [item, onEdit])

  const handleDelete = useCallback(() => {
    onDelete(item)
  }, [item, onDelete])

  const rightActions = useMemo<SwipeableItemAction[]>(
    () => [
      {
        icon: 'create-outline',
        type: 'secondary',
        onPress: handleEdit,
      },
      {
        icon: 'trash-outline',
        type: 'tertiary',
        onPress: handleDelete,
      },
    ],
    [handleDelete, handleEdit],
  )

  return (
    <SwipeableItem rowKey={`todo-${item.id}`} rightActions={rightActions} onDelete={handleDelete}>
      <MyCard elevation="none" radius="medium">
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
      </MyCard>
    </SwipeableItem>
  )
})

function TodoListViewInner({
  todos,
  isLoading,
  isError,
  isRefreshing,
  onRefresh,
  onRetry,
  onEdit,
  onDelete,
}: TodoListViewProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TodoItem>) => (
      <TodoRow item={item} onEdit={onEdit} onDelete={onDelete} />
    ),
    [onDelete, onEdit],
  )

  const listEmpty = useMemo(() => {
    if (isLoading) {
      return <MySkeleton preset="listRow" count={6} />
    }
    if (isError) {
      return (
        <MyErrorState
          title={t('todo.errorTitle')}
          message={t('todo.errorDescription')}
          retryLabel={t('todo.retry')}
          onRetry={onRetry}
        />
      )
    }
    return <MyEmptyState title={t('todo.emptyTitle')} subtitle={t('todo.emptyDescription')} />
  }, [isError, isLoading, onRetry, t])

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
          ListEmptyComponent={listEmpty}
        />
      </SwipeableItemProvider>
    </View>
  )
}

export const TodoListView = memo(TodoListViewInner)
