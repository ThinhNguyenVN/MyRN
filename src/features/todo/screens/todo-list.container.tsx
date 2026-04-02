import { router } from 'expo-router'
import { useCallback } from 'react'

import { Routes } from '@/constants/routes'
import { useDeleteTodoMutation, useGetTodosQuery } from '@/features/todo/todo-api'
import type { TodoItem } from '@/features/todo/types'

import { TodoListView } from './todo-list.view'

export default function TodoListScreenContainer() {
  const { data, isLoading, isFetching, refetch } = useGetTodosQuery({ limit: 30, skip: 0 })
  const [deleteTodo] = useDeleteTodoMutation()

  const handleRefresh = useCallback(() => {
    void refetch()
  }, [refetch])

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
      isRefreshing={isFetching}
      onRefresh={handleRefresh}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
