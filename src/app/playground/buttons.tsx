import { ScrollView } from 'react-native'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function ButtonsScreen() {
  const styles = useThemedStyles(generateStyles)
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Buttons
      </MyText>
      <MyButton
        width={'full'}
        text="Primary large"
        size={'large'}
        type="primary"
        onPress={() => {}}
        left={<MyIcon name="key" color="icon/active/tertiary" />}
        right={<MyIcon name="home" color="icon/active/tertiary" />}
      />
      <MyView style={styles.buttonRow}>
        <MyButton
          width={'full'}
          text="Primary"
          size={'small'}
          type="primary"
          loading
          onPress={() => {}}
          left={<MyIcon name="home" color="icon/active/tertiary" />}
        />
        <MyButton width={'full'} text="Primary" size={'small'} type="primary" onPress={() => {}} />
      </MyView>
      <MyButton
        text="Secondary"
        width={'auto'}
        size={'small'}
        type="secondary"
        onPress={() => {}}
      />
      <MyButton text="Tertiary" width={'auto'} type="tertiary" onPress={() => {}} />
      <MyButton text="Light" width={'auto'} type="light" onPress={() => {}} />
      <MyButton text="Dark" width={'auto'} type="dark" onPress={() => {}} />
      <MyButton
        text="Small"
        type="primary"
        size="small"
        onPress={() => {}}
        left={<MyIcon name="key" color="icon/active/tertiary" />}
      />
      <MyButton text="Loading" type="secondary" loading onPress={() => {}} />
      <MyButton text="Disabled" type="primary" onPress={() => {}} disabled />

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Button Icon
      </MyText>
      <MyView flexDirection="row" flexWrap="wrap" gap={8}>
        <MyButton.Icon icon="home" type="primary" onPress={() => {}} />
        <MyButton.Icon icon="add" type="secondary" size="small" onPress={() => {}} />
        <MyButton.Icon icon="heart-outline" type="tertiary" onPress={() => {}} />
        <MyButton.Icon icon="settings-outline" type="light" size="small" onPress={() => {}} />
        <MyButton.Icon icon="moon" type="dark" onPress={() => {}} />
        <MyButton.Icon icon="refresh" type="primary" loading onPress={() => {}} />
        <MyButton.Icon icon="trash-outline" type="secondary" disabled onPress={() => {}} />
      </MyView>
    </ScrollView>
  )
}
