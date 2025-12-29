import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const Home: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home</Text>
    </View>
  )
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
})

export default Home