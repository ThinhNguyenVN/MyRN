import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(5, 'Enter username'),
  password: z.string().min(5, 'Enter password'),
})

export type LoginForm = z.infer<typeof loginSchema>
export type LoginFormInput = z.input<typeof loginSchema>

export const loginDefaultValues: LoginFormInput = {
  username: '',
  password: '',
}

export type LoginScreenViewProps = {
  scrollToField: (name: string) => void
  onClosePress: () => void
}
