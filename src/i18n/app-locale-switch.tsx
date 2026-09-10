import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import MySegment, { type MySegmentSize } from '@/components/elements/my-segment'
import { LOCALE_SWITCH_ORDER } from '@/i18n/locale-resolver'
import { useAppLocale } from '@/i18n/use-app-locale'

type AppLocaleSwitchProps = {
  size?: MySegmentSize
}

function AppLocaleSwitchInner({ size = 'default' }: AppLocaleSwitchProps) {
  const { t } = useTranslation()
  const { locale, setLocale } = useAppLocale()

  const options = useMemo(
    () =>
      LOCALE_SWITCH_ORDER.map((id) => ({
        value: id,
        label: t(`shell.locale.${id}`),
        accessibilityLabel: t(`shell.locale.${id}A11y`),
      })),
    [t],
  )

  return (
    <MySegment
      options={options}
      value={locale}
      onChange={setLocale}
      size={size}
      accessibilityLabel={t('shell.locale.label')}
    />
  )
}

export const AppLocaleSwitch = memo(AppLocaleSwitchInner)
