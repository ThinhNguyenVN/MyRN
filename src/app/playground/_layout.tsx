import { Stack } from 'expo-router'

import { NavigationBarHeader } from '@/components/ui/navigation-bar'

function titleFromRoute(routeName: string): string {
  if (routeName === 'toast') return 'Toast & Confirmation'
  return routeName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function PlaygroundLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        header: (props) => <NavigationBarHeader {...props} />,
        headerShown: true,
        title: titleFromRoute(route.name ?? ''),
      })}
    />
  )
}
