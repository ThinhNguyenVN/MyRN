import { Redirect } from 'expo-router'

import { Routes } from '@/constants/routes'
import LoginScreen from '@/features/auth/screens/login-screen.container'
import { selectIsAuthenticated } from '@/features/auth/auth-slice'
import { useAppSelector } from '@/store/hooks'

export default function LoginRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  if (isAuthenticated) {
    return <Redirect href={Routes.defaultRoute} />
  }

  return <LoginScreen />
}
