import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'

export default function ModalScreen() {
  return (
    <MyView style={styles.container}>
      <MyText typography={'h1'}>This is a modal</MyText>
      <Link href="/" dismissTo style={styles.link}>
        <MyText typography={'h1'}>Go to home screen</MyText>
      </Link>
    </MyView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
})
