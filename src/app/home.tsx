import React from 'react'
import { StyleSheet } from 'react-native'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

const Home: React.FC = () => {
  return (
    <MyView style={styles.container}>
      <MyText typography="h5">Welcome Home</MyText>
    </MyView>
  )
}

export default Home
