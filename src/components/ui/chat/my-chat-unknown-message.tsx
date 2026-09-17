import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

function MyChatUnknownMessage() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  return (
    <MySurface radius="large" style={styles.unknownCard}>
      <MyText typography="caption" color="text/active/secondary">
        {t('components.chat.unknownMessage')}
      </MyText>
    </MySurface>
  )
}

export default memo(MyChatUnknownMessage)
