import { Stack } from 'expo-router'

export default function PublicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="login"
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="home" />
    </Stack>
  )
}
