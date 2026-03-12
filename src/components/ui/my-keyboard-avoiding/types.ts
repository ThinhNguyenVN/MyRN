import type {
  KeyboardAwareScrollViewProps,
  KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller'
import type { ScrollView } from 'react-native'

export type MyKeyboardAvoidingScrollViewProps = KeyboardAwareScrollViewProps & {
  showToolbar?: boolean
}

export type MyKeyboardAvoidingScrollViewRef = ScrollView | KeyboardAwareScrollViewRef
