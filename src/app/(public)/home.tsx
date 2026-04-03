import React from 'react'
import { StyleSheet } from 'react-native'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { NavigationBarHeader } from '@/components/ui/navigation-bar'
import { Stack } from 'expo-router'
import MyButton from '@/components/elements/my-button'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

const Home: React.FC = () => {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <MyView flexDirection="row" gap={8} alignItems="center">
              <MyButton.Icon icon="settings" type="light" size="small" onPress={() => {}} />
              <MyButton.Icon icon="filter" type="light" size="small" onPress={() => {}} />
            </MyView>
          ),
          header: (props) => <NavigationBarHeader {...props} />,
          title: 'Home',
        }}
      />
      <MyView style={styles.container}>
        <MyText typography="h5">Welcome Home</MyText>
      </MyView>
    </>
  )
}

export default Home
