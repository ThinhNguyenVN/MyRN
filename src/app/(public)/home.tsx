import React from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import templateConfig from '@root/template.config.json'

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
  const { t } = useTranslation()
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
          title: t('tabs.home'),
        }}
      />
      <MyView style={styles.container}>
        <MyText typography="h5">{t('home.welcome', { appName: templateConfig.appName })}</MyText>
      </MyView>
    </>
  )
}

export default Home
