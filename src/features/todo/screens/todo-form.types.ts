import { z } from 'zod'

export const todoFormSchema = z.object({
  todo: z.string().trim().min(1, 'todo.formValidationTodo'),
  completed: z.boolean(),
})

export type TodoFormInput = z.input<typeof todoFormSchema>

export const todoFormDefaultValues: TodoFormInput = {
  todo: '',
  completed: false,
}
