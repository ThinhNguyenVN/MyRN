import { router } from 'expo-router'
import { useCallback, useEffect } from 'react'

import { selectIsAuthenticated } from '@/features/auth/auth-slice'
import { useDeleteTodoMutation, useGetTodosQuery } from '@/features/todo/todo-api'
import type { TodoItem } from '@/features/todo/types'
import { useAppSelector } from '@/store/hooks'

import { TodoListView } from './todo-list.view'

export default function TodoListScreenContainer() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated])

  const { data, isLoading, isFetching, refetch } = useGetTodosQuery(
    { limit: 30, skip: 0 },
    { skip: !isAuthenticated },
  )
  const [deleteTodo] = useDeleteTodoMutation()

  const handleRefresh = useCallback(() => {
    void refetch()
  }, [refetch])

  const handleEdit = useCallback((item: TodoItem) => {
    router.push({
      pathname: '/todo/form',
      params: { id: String(item.id) },
    })
  }, [])

  const handleDelete = useCallback(
    async (item: TodoItem) => {
      await deleteTodo(item.id).unwrap()
    },
    [deleteTodo],
  )

  if (!isAuthenticated) return null

  return (
    <TodoListView
      todos={data?.todos ?? []}
      isLoading={isLoading}
      isRefreshing={isFetching}
      onRefresh={handleRefresh}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
