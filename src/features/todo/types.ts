export type TodoItem = {
  id: number
  todo: string
  completed: boolean
  userId: number
}

export type TodoListResponse = {
  todos: TodoItem[]
  total: number
  skip: number
  limit: number
}

export type GetTodosParams = {
  limit?: number
  skip?: number
  userId?: number
}

export type CreateTodoPayload = {
  todo: string
  completed: boolean
  userId: number
}

export type UpdateTodoPayload = {
  id: number
  todo?: string
  completed?: boolean
}

export type DeleteTodoResponse = TodoItem & {
  isDeleted: boolean
  deletedOn: string
}
