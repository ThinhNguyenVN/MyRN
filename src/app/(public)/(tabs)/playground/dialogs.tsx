import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyTextInput from '@/components/elements/my-text-input'
import MyView from '@/components/elements/my-view'
import { ActionDialog } from '@/components/ui/action-dialog'
import { ChoiceChips } from '@/components/ui/choice-chips'
import { InfoRow } from '@/components/ui/info-row'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { generateStyles } from '@/features/playground/styles'
import { useThemedStyles } from '@/theme/theme-context'
import { formatDecimalString } from '@/utils/format-decimal'

const PERIODS = ['month', 'quarter', 'year'] as const

/** Demo of the write-dialog building blocks: `ActionDialog`, `ChoiceChips`, `InfoRow`. */
export default function DialogsScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [period, setPeriod] = useState<string>('month')
  const [visible, setVisible] = useState(false)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const options = useMemo(
    () => PERIODS.map((value) => ({ value, label: t(`playground.dialogsPeriod.${value}`) })),
    [t],
  )
  const open = useCallback(() => {
    setError(null)
    setVisible(true)
  }, [])
  const close = useCallback(() => setVisible(false), [])
  const submit = useCallback(() => {
    if (!note.trim()) {
      setError(t('playground.dialogsNoteRequired'))
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setVisible(false)
      setNote('')
    }, 800)
  }, [note, t])

  return (
    <MyKeyboardAvoiding.ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.sectionTitle}>
        ChoiceChips
      </MyText>
      <ChoiceChips options={options} value={period} onChange={setPeriod} />

      <MyText typography="label" style={styles.sectionTitle}>
        InfoRow
      </MyText>
      <MyView>
        <InfoRow label={t('playground.dialogsPlan')} value="Premium" />
        <InfoRow
          label={t('playground.dialogsAmount')}
          value={`${formatDecimalString('3990000.00')}đ`}
        />
        <InfoRow label={t('playground.dialogsEmpty')} value={null} />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        ActionDialog
      </MyText>
      <MyButton text={t('playground.dialogsOpen')} onPress={open} width="auto" />
      <ActionDialog
        visible={visible}
        title={t('playground.dialogsTitle')}
        submitText={t('playground.dialogsSubmit')}
        submitting={submitting}
        error={error}
        onClose={close}
        onSubmit={submit}
      >
        <ChoiceChips options={options} value={period} disabled={submitting} onChange={setPeriod} />
        <MyTextInput
          title={t('playground.dialogsNote')}
          value={note}
          onChangeText={setNote}
          editable={!submitting}
        />
      </ActionDialog>
    </MyKeyboardAvoiding.ScrollView>
  )
}
