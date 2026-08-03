import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

import { Routes } from '@/constants/routes'
import { useDeleteTodoMutation, useGetTodosQuery } from '@/features/todo/todo-api'
import type { TodoItem } from '@/features/todo/types'

import { TodoListView } from './todo-list.view'

export default function TodoListScreenContainer() {
  const { data, isLoading, isFetching, isError, refetch } = useGetTodosQuery({
    limit: 30,
    skip: 0,
  })
  const [deleteTodo] = useDeleteTodoMutation()
  const [isPullRefreshing, setIsPullRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    setIsPullRefreshing(true)
    void refetch()
  }, [refetch])

  const handleRetry = useCallback(() => {
    void refetch()
  }, [refetch])

  useEffect(() => {
    if (isFetching) return
    if (!isPullRefreshing) return
    setIsPullRefreshing(false)
  }, [isFetching, isPullRefreshing])

  const handleEdit = useCallback((item: TodoItem) => {
    router.push({
      pathname: Routes.todoForm,
      params: { id: String(item.id) },
    })
  }, [])

  const handleDelete = useCallback(
    async (item: TodoItem) => {
      await deleteTodo(item.id).unwrap()
    },
    [deleteTodo],
  )

  return (
    <TodoListView
      todos={data?.todos ?? []}
      isLoading={isLoading}
      isError={isError}
      isRefreshing={isPullRefreshing}
      onRefresh={handleRefresh}
      onRetry={handleRetry}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
