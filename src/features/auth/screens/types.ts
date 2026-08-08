import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(5, 'auth.usernameMin'),
  password: z.string().min(5, 'auth.passwordMin'),
  remember: z.boolean(),
})

export type LoginForm = z.infer<typeof loginSchema>
export type LoginFormInput = z.input<typeof loginSchema>

export const loginDefaultValues: LoginFormInput = {
  username: '',
  password: '',
  remember: true,
}

export type LoginScreenViewProps = {
  scrollToField: (name: string) => void
}
