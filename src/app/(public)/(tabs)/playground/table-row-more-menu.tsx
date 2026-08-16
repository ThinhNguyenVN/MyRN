import { useCallback, useMemo } from 'react'
import { Alert, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import { TableRowMoreMenu } from '@/components/ui/table-row-more-menu'
import { generateStyles } from '@/features/playground/styles'
import { useThemedStyles } from '@/theme/theme-context'

export default function TableRowMoreMenuScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  const handleEdit = useCallback(() => {
    Alert.alert(t('playground.tableRowMoreEdit'))
  }, [t])

  const handleDelete = useCallback(() => {
    Alert.alert(t('playground.tableRowMoreDelete'))
  }, [t])

  const items = useMemo(
    () => [
      {
        key: 'edit',
        text: t('playground.tableRowMoreEdit'),
        icon: 'create-outline' as const,
        onPress: handleEdit,
      },
      {
        key: 'delete',
        text: t('playground.tableRowMoreDelete'),
        icon: 'trash-outline' as const,
        type: 'tertiary' as const,
        onPress: handleDelete,
      },
    ],
    [handleDelete, handleEdit, t],
  )

  return (
    <View style={styles.screenContent}>
      <MyText typography="body">{t('playground.tableRowMoreIntro')}</MyText>
      <TableRowMoreMenu items={items} accessibilityLabel={t('playground.tableRowMoreMore')} />
    </View>
  )
}
