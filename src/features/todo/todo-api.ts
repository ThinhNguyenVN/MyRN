import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/api/axios-base-query'
import { Endpoints } from '@/constants/api'
import type {
  CreateTodoPayload,
  DeleteTodoResponse,
  GetTodosParams,
  TodoItem,
  TodoListResponse,
  UpdateTodoPayload,
} from './types'
import { AppDispatch, RootState } from '@/store/store'

const TODO_LIST_TAG_ID = 'LIST'
type TodoListQueryArg = GetTodosParams | void
type PatchCollection = { undo: () => void }

const getCachedTodoListArgs = (state: RootState): TodoListQueryArg[] =>
  todoApi.util.selectCachedArgsForQuery(state, 'getTodos') as TodoListQueryArg[]

const patchAllTodoLists = (
  dispatch: AppDispatch,
  getState: () => RootState,
  updater: (draft: TodoListResponse) => void,
): PatchCollection[] =>
  getCachedTodoListArgs(getState()).map((queryArg) =>
    dispatch(todoApi.util.updateQueryData('getTodos', queryArg, updater)),
  )

export const todoApi = createApi({
  reducerPath: 'todoApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Todo', 'TodoList'],
  endpoints: (builder) => ({
    getTodos: builder.query<TodoListResponse, GetTodosParams | void>({
      query: (params) => {
        const limit = params?.limit
        const skip = params?.skip
        const userId = params?.userId
        if (typeof userId === 'number') {
          return {
            url: Endpoints.todosByUser(userId),
            method: 'GET',
            params: { limit, skip },
          }
        }
        return {
          url: Endpoints.todos,
          method: 'GET',
          params: { limit, skip },
        }
      },
      providesTags: (result) => [
        { type: 'TodoList', id: TODO_LIST_TAG_ID },
        ...(result?.todos.map((item) => ({ type: 'Todo' as const, id: item.id })) ?? []),
      ],
    }),
    getTodoById: builder.query<TodoItem, number>({
      query: (id) => ({ url: Endpoints.todoById(id), method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Todo', id }],
    }),
    createTodo: builder.mutation<TodoItem, CreateTodoPayload>({
      query: (body) => ({
        url: Endpoints.addTodo,
        method: 'POST',
        data: body,
      }),
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        const tempId = -Date.now()
        const optimisticTodo: TodoItem = { id: tempId, ...arg }
        const patches = patchAllTodoLists(dispatch, getState as () => RootState, (draft) => {
          draft.todos.unshift(optimisticTodo)
          draft.total += 1
        })

        try {
          const { data } = await queryFulfilled
          getCachedTodoListArgs(getState() as RootState).forEach((queryArg) => {
            dispatch(
              todoApi.util.updateQueryData('getTodos', queryArg, (draft) => {
                const idx = draft.todos.findIndex((item) => item.id === tempId)
                if (idx >= 0) draft.todos[idx] = data
              }),
            )
          })
        } catch {
          patches.forEach((patch) => patch.undo())
        }
      },
      // invalidatesTags: [{ type: 'TodoList', id: TODO_LIST_TAG_ID }],
      invalidatesTags: [],
    }),
    updateTodo: builder.mutation<TodoItem, UpdateTodoPayload>({
      query: ({ id, ...body }) => ({
        url: Endpoints.todoById(id),
        method: 'PUT',
        data: body,
      }),
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllTodoLists(dispatch, getState as () => RootState, (draft) => {
          const item = draft.todos.find((todo) => todo.id === arg.id)
          if (item) {
            if (typeof arg.todo === 'string') item.todo = arg.todo
            if (typeof arg.completed === 'boolean') item.completed = arg.completed
          }
        })

        const detailPatch = dispatch(
          todoApi.util.updateQueryData('getTodoById', arg.id, (draft) => {
            if (typeof arg.todo === 'string') draft.todo = arg.todo
            if (typeof arg.completed === 'boolean') draft.completed = arg.completed
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patches.forEach((patch) => patch.undo())
          detailPatch.undo()
        }
      },
      // invalidatesTags: (_result, _error, arg) => [
      //   { type: 'Todo', id: arg.id },
      //   { type: 'TodoList', id: TODO_LIST_TAG_ID },
      // ],
      invalidatesTags: [],
    }),
    deleteTodo: builder.mutation<DeleteTodoResponse, number>({
      query: (id) => ({
        url: Endpoints.todoById(id),
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const patches = patchAllTodoLists(dispatch, getState as () => RootState, (draft) => {
          const prevLen = draft.todos.length
          draft.todos = draft.todos.filter((item) => item.id !== id)
          if (draft.todos.length < prevLen) draft.total = Math.max(0, draft.total - 1)
        })
        try {
          await queryFulfilled
        } catch {
          patches.forEach((patch) => patch.undo())
        }
      },
      // invalidatesTags: (_result, _error, id) => [
      //   { type: 'Todo', id },
      //   { type: 'TodoList', id: TODO_LIST_TAG_ID },
      // ],
      invalidatesTags: [],
    }),
  }),
})

export const {
  useGetTodosQuery,
  useGetTodoByIdQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todoApi
