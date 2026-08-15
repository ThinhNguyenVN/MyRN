import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { getVisiblePages } from './utils'
import { PaginationPageButton } from './pagination-page-button'
import { generateStyles } from './styles'
import type { PaginationProps } from './type'

function PaginationComponent({
  page,
  pageSize,
  total,
  onPrev,
  onNext,
  onPageChange,
}: PaginationProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const maxPage = useMemo(() => Math.max(1, Math.ceil(total / pageSize) || 1), [pageSize, total])
  const visiblePages = useMemo(() => getVisiblePages(page, maxPage), [maxPage, page])

  if (total <= 0) {
    return null
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const canPrev = page > 1
  const canNext = page < maxPage

  return (
    <MyView style={styles.row}>
      <MyText typography="caption" style={styles.summary}>
        {t('pagination.summary', { from, to, total })}
      </MyText>
      <MyView style={styles.controls}>
        <MyPressable
          style={[styles.navBtn, !canPrev ? styles.navBtnDisabled : null]}
          onPress={onPrev}
          disabled={!canPrev}
          accessibilityLabel={t('pagination.prev')}
        >
          <MyIcon name="arrow-back" size={20} color="icon/active/secondary" />
        </MyPressable>
        {visiblePages.map((pageNumber) => (
          <PaginationPageButton
            key={`pagination-page-${pageNumber}`}
            pageNumber={pageNumber}
            active={pageNumber === page}
            onPress={onPageChange}
          />
        ))}
        <MyPressable
          style={[styles.navBtn, !canNext ? styles.navBtnDisabled : null]}
          onPress={onNext}
          disabled={!canNext}
          accessibilityLabel={t('pagination.next')}
        >
          <MyIcon name="arrow-forward" size={20} color="icon/active/secondary" />
        </MyPressable>
      </MyView>
    </MyView>
  )
}

export default memo(PaginationComponent)
