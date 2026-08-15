import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { Pagination } from '@/components/ui/pagination'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

const TOTAL = 87
const PAGE_SIZE = 10

export default function PaginationScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  const handlePrev = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setPage((prev) => Math.min(Math.ceil(TOTAL / PAGE_SIZE), prev + 1))
  }, [])

  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.paginationIntro')}
      </MyText>
      <MyView style={styles.content}>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={TOTAL}
          onPrev={handlePrev}
          onNext={handleNext}
          onPageChange={setPage}
        />
      </MyView>
    </MyKeyboardAvoiding.ScrollView>
  )
}
