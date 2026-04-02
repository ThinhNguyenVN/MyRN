import { Redirect, Stack, router } from 'expo-router'

import MyButton from '@/components/elements/my-button'
import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import { Routes } from '@/constants/routes'
import { selectIsAuthenticated } from '@/features/auth/auth-slice'
import { useAppSelector } from '@/store/hooks'

export default function PrivateLayout() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

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
          title: 'Todo',
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
          title: 'Todo Editor',
        }}
      />
    </Stack>
  )
}
