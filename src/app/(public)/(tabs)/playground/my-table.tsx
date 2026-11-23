import { useCallback, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { MyTable, type MyTableColumn } from '@/components/ui/my-table'
import { PLAYGROUND_TABLE_PAGE_SIZE } from '@/features/playground/my-table/constants'
import {
  PLAYGROUND_TABLE_ITEMS,
  type PlaygroundTableItem,
} from '@/features/playground/my-table/data'
import {
  playgroundTableColumnVisibility,
  type PlaygroundTableColumns,
} from '@/features/playground/my-table/utils'
import { generateStyles } from '@/features/playground/styles'
import { useWindowWidth } from '@/hooks/dimenstions-hooks'
import { useThemedStyles } from '@/theme/theme-context'

export default function MyTableScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const windowWidth = useWindowWidth()
  const [page, setPage] = useState(1)
  const handleRowPress = useCallback(
    (item: PlaygroundTableItem) => Alert.alert(t('playground.myTableRowPressed', { id: item.id })),
    [t],
  )
  const rowLabel = useCallback((item: PlaygroundTableItem) => item.id, [])

  const pageItems = PLAYGROUND_TABLE_ITEMS.slice(
    (page - 1) * PLAYGROUND_TABLE_PAGE_SIZE,
    page * PLAYGROUND_TABLE_PAGE_SIZE,
  )

  const columns = useMemo<MyTableColumn<PlaygroundTableItem, PlaygroundTableColumns>[]>(
    () => [
      {
        key: 'name',
        flex: 1.4,
        minWidth: 140,
        renderHeader: () => <MyText typography="caption">{t('playground.myTableName')}</MyText>,
        renderCell: (item) => (
          <MyText typography="body" numberOfLines={1}>
            {item.name}
          </MyText>
        ),
      },
      {
        key: 'category',
        flex: 1,
        minWidth: 96,
        renderHeader: () => <MyText typography="caption">{t('playground.myTableCategory')}</MyText>,
        renderCell: (item) => (
          <MyText typography="caption" numberOfLines={1}>
            {item.category}
          </MyText>
        ),
      },
      {
        key: 'branch',
        flex: 1,
        minWidth: 96,
        hideWhen: (visibility) => !visibility.showBranch,
        renderHeader: () => <MyText typography="caption">{t('playground.myTableBranch')}</MyText>,
        renderCell: (item) => (
          <MyText typography="caption" numberOfLines={1}>
            {item.branch}
          </MyText>
        ),
      },
    ],
    [t],
  )

  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.myTableIntro')}
      </MyText>
      <MyView style={styles.content}>
        <MyTable<PlaygroundTableItem, PlaygroundTableColumns>
          data={pageItems}
          keyExtractor={(item) => item.id}
          resolveColumns={playgroundTableColumnVisibility}
          fallbackWidth={windowWidth}
          columns={columns}
          fitWidth
          onRowPress={handleRowPress}
          getRowAccessibilityLabel={rowLabel}
          page={page}
          pageSize={PLAYGROUND_TABLE_PAGE_SIZE}
          total={PLAYGROUND_TABLE_ITEMS.length}
          onPrevPage={() => setPage((current) => Math.max(1, current - 1))}
          onNextPage={() => setPage((current) => current + 1)}
          onPageChange={setPage}
        />
      </MyView>
    </MyKeyboardAvoiding.ScrollView>
  )
}
