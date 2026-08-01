import { ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function ButtonsScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.linksButtons')}
      </MyText>

      <MyButton
        width={'full'}
        text={t('playground.buttonsOpenDetail')}
        size={'large'}
        type="secondary"
        onPress={() => router.push('/playground/buttons/detail')}
        left={<MyIcon name="arrow-forward" color="icon/active/tertiary" />}
      />
      <MyButton
        width={'full'}
        text={t('playground.buttonsPrimaryLarge')}
        size={'large'}
        type="primary"
        onPress={() => {}}
        left={<MyIcon name="key" color="icon/active/tertiary" />}
        right={<MyIcon name="home" color="icon/active/tertiary" />}
      />
      <MyView style={styles.buttonRow}>
        <MyButton
          width={'full'}
          text={t('playground.buttonsPrimaryInRow')}
          size={'small'}
          type="primary"
          onPress={() => {}}
          left={<MyIcon name="home" color="icon/active/tertiary" />}
        />
        <MyButton
          width={'full'}
          text={t('playground.buttonsPrimaryInRow')}
          size={'small'}
          type="primary"
          onPress={() => {}}
        />
      </MyView>
      <MyButton
        text={t('playground.buttonsSecondary')}
        width={'auto'}
        size={'small'}
        type="secondary"
        onPress={() => {}}
      />
      <MyButton
        text={t('playground.buttonsTertiary')}
        width={'auto'}
        type="tertiary"
        onPress={() => {}}
      />
      <MyButton
        text={t('playground.buttonsLight')}
        width={'auto'}
        type="light"
        onPress={() => {}}
      />
      <MyButton text={t('playground.buttonsDark')} width={'auto'} type="dark" onPress={() => {}} />
      <MyButton
        text={t('playground.buttonsSmall')}
        type="primary"
        size="small"
        onPress={() => {}}
        left={<MyIcon name="key" color="icon/active/tertiary" />}
      />
      <MyButton text={t('common.loading')} type="secondary" loading onPress={() => {}} />
      <MyButton text={t('common.disabled')} type="primary" onPress={() => {}} disabled />

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.buttonsIconSection')}
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
