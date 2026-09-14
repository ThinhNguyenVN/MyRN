import { Redirect, Stack, router } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useAppInitState } from '@/hooks/app-init-hooks'

import MyButton from '@/components/elements/my-button'
import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import { Routes } from '@/constants/routes'
import { selectIsAuthenticated } from '@/features/auth/auth-slice'
import { useAppSelector } from '@/store/hooks'

export default function PrivateLayout() {
  const { t } = useTranslation()
  const { isInitialized } = useAppInitState()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  /**
   * Wait for auth restore before deciding to redirect — otherwise Redux's
   * `isAuthenticated` initial value (`false`) would bounce an already
   * signed-in user to /login for a moment. Root `_layout.tsx`'s `AppInitGate`
   * already guarantees this wait on native; this covers web, where that gate
   * no longer blocks `(public)` content (see `_layout.tsx`) — `(private)` on
   * web still waits.
   */
  if (!isInitialized) return null

  if (!isAuthenticated) {
    return <Redirect href={Routes.login} />
  }

  return (
    <Stack>
      <Stack.Screen
        name="todo/index"
        options={{
          header: (props) => <NavigationBarHeader {...props} />,
          headerShown: true,
          title: t('todo.screenTitle'),
          headerRight: () => (
            <MyButton.Icon
              icon="add"
              type="light"
              size="small"
              onPress={() => router.push(Routes.todoForm)}
            />
          ),
        }}
      />
      <Stack.Screen
        name="todo/form"
        options={{
          header: (props) => <NavigationBarHeader {...props} />,
          headerShown: true,
          title: t('todo.editorTitle'),
        }}
      />
    </Stack>
  )
}
