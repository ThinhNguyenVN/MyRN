import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Toast } from '@/components/ui/toast'

/** Toast for actions / destinations not wired yet. */
export function useComingSoon() {
  const { t } = useTranslation()

  return useCallback(() => {
    Toast.show({ text: t('common.comingSoon'), type: 'info' })
  }, [t])
}
