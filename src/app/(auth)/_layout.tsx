import { Redirect, Stack } from 'expo-router'

import { Routes } from '@/constants/routes'
import { selectIsAuthenticated } from '@/features/auth/auth-slice'
import { useAppSelector } from '@/store/hooks'

export default function AuthLayout() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  if (isAuthenticated) {
    return <Redirect href={Routes.defaultRoute} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
