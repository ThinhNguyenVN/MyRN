export interface HomeScreenViewProps {
  isAuthenticated: boolean
  authSummary: string
  onGoTodo: () => void
  onLogout: () => void
  onLogin: () => void
}
