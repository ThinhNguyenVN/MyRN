import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'

import { MyForm } from '@/components/form'
import { selectAuthUser } from '@/features/auth/auth-slice'
import {
  useCreateTodoMutation,
  useGetTodoByIdQuery,
  useUpdateTodoMutation,
} from '@/features/todo/todo-api'
import { useAppSelector } from '@/store/hooks'

import { todoFormDefaultValues, todoFormSchema, type TodoFormInput } from './todo-form.types'
import { TodoFormView } from './todo-form.view'

export default function TodoFormScreenContainer() {
  const params = useLocalSearchParams<{ id?: string }>()
  const authUser = useAppSelector(selectAuthUser)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const todoId = Number(params.id)
  const isEditMode = Number.isFinite(todoId)
  const { data } = useGetTodoByIdQuery(todoId, { skip: !isEditMode })
  const [createTodo] = useCreateTodoMutation()
  const [updateTodo] = useUpdateTodoMutation()

  const defaultValues = useMemo<TodoFormInput>(() => {
    if (isEditMode && data) {
      return {
        todo: data.todo,
        completed: data.completed,
      }
    }
    return todoFormDefaultValues
  }, [isEditMode, data])

  const formKey = isEditMode ? `edit-${todoId}-${data?.id ?? 'pending'}` : 'add-todo'

  const handleSubmit = useCallback(
    async (values: TodoFormInput) => {
      setIsSubmitting(true)
      try {
        if (isEditMode) {
          await updateTodo({
            id: todoId,
            todo: values.todo,
            completed: values.completed,
          }).unwrap()
        } else {
          await createTodo({
            todo: values.todo,
            completed: values.completed,
            userId: authUser?.id ?? 1,
          }).unwrap()
        }
        router.back()
      } finally {
        setIsSubmitting(false)
      }
    },
    [isEditMode, updateTodo, todoId, createTodo, authUser],
  )

  return (
    <MyForm<TodoFormInput>
      key={formKey}
      schema={todoFormSchema}
      defaultValues={defaultValues}
      mode="onSubmit"
      reValidateMode="onChange"
    >
      <TodoFormView
        mode={isEditMode ? 'edit' : 'add'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </MyForm>
  )
}
