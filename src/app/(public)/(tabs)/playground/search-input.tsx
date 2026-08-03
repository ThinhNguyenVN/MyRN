import { useCallback, useState } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MySearchInput from '@/components/elements/my-search-input'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function SearchInputPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const handleChangeText = useCallback((text: string) => {
    setQuery(text)
  }, [])

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.searchInputIntro')}
      </MyText>

      <MySearchInput
        value={query}
        onChangeText={handleChangeText}
        placeholder={t('playground.searchInputPlaceholder')}
        title={t('playground.searchInputTitle')}
      />

      <MyText typography="body" color="text/active/secondary">
        {t('playground.searchInputValue', { value: query || '—' })}
      </MyText>
    </ScrollView>
  )
}
