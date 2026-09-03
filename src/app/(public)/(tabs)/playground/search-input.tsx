import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MySearchInput from '@/components/elements/my-search-input'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ExpandableSearch } from '@/components/ui/expandable-search'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function SearchInputPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [expandableQuery, setExpandableQuery] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleChangeText = useCallback((text: string) => {
    setQuery(text)
  }, [])

  const handleExpandableChangeText = useCallback((text: string) => {
    setExpandableQuery(text)
  }, [])

  const handleExpandedChange = useCallback((next: boolean) => {
    setExpanded(next)
  }, [])

  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.linksSearchInput')}
      </MyText>
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

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.linksExpandableSearch')}
      </MyText>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.expandableSearchIntro')}
      </MyText>
      <MyView style={styles.buttonRow}>
        <ExpandableSearch
          value={expandableQuery}
          onChangeText={handleExpandableChangeText}
          placeholder={t('playground.expandableSearchPlaceholder')}
          expanded={expanded}
          onExpandedChange={handleExpandedChange}
          searchAccessibilityLabel={t('playground.linksExpandableSearch')}
          closeAccessibilityLabel={t('common.back')}
        />
      </MyView>
      <MyText typography="body" color="text/active/secondary">
        {t('playground.searchInputValue', { value: expandableQuery || '—' })}
      </MyText>
    </MyKeyboardAvoiding.ScrollView>
  )
}
