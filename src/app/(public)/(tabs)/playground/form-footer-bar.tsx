import { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { FormFooterBar } from '@/components/ui/form-footer-bar'
import { Toast } from '@/components/ui/toast'
import { generateStyles } from '@/features/playground/styles'
import { useThemedStyles } from '@/theme/theme-context'

export default function FormFooterBarScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)

  const handleSave = useCallback(() => {
    setBusy(true)
    Toast.show({ text: t('playground.formFooterSaved'), type: 'success' })
    setTimeout(() => {
      setBusy(false)
    }, 400)
  }, [t])

  const handleSecondary = useCallback(() => {
    Toast.show({ text: t('playground.formFooterSecondary'), type: 'info' })
  }, [t])

  const extraActions = useMemo(
    () => [
      {
        id: 'secondary',
        label: t('playground.formFooterSecondary'),
        type: 'secondary' as const,
        onPress: handleSecondary,
        visible: true,
      },
    ],
    [handleSecondary, t],
  )

  return (
    <View style={styles.screenContent}>
      <MyText typography="body">{t('playground.formFooterIntro')}</MyText>
      <MyView fillParent={false}>
        <FormFooterBar
          canSave
          busy={busy}
          saveLabel={t('common.done')}
          onSave={handleSave}
          extraActions={extraActions}
          showAmount
          totalLabel={t('playground.formFooterTotal')}
          totalText="1.250.000 đ"
          moreTitle={t('playground.formFooterMore')}
          moreAccessibilityLabel={t('playground.formFooterMore')}
        />
      </MyView>
    </View>
  )
}
