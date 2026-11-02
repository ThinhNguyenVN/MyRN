import Head from 'expo-router/head'
import { memo } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import type { NotFoundScreenViewProps } from '../types'
import { generateStyles } from './styles'

function NotFoundScreenViewInner({
  pathname,
  primaryActionLabel,
  onPrimaryActionPress,
  canGoBack,
  onBackPress,
}: NotFoundScreenViewProps) {
  const { t } = useTranslation()
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <Head>
        <title>{t('notFound.title')}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <MySurface
        elevation="soft/down/small"
        radius="large"
        backgroundColor={getColor('fill/background/tertiary')}
        style={styles.card}
      >
        <MyView style={styles.cardBody}>
          <MyText style={styles.code} accessibilityElementsHidden importantForAccessibility="no">
            404
          </MyText>

          <MyText typography="body" color="text/active/secondary" style={styles.description}>
            {t('notFound.description')}
          </MyText>

          <ConditionRenderer when={pathname.length > 1}>
            <MyView style={styles.pathPill}>
              <MyIcon name="link-outline" size={14} color={getColor('text/active/tertiary')} />
              <MyText
                typography="label"
                color="text/active/secondary"
                numberOfLines={1}
                style={styles.pathText}
              >
                {pathname}
              </MyText>
            </MyView>
          </ConditionRenderer>

          <MyView style={styles.actions}>
            <ConditionRenderer when={canGoBack}>
              <MyButton
                type="secondary"
                text={t('notFound.goBack')}
                left={<MyIcon name="arrow-back" size={18} color={getColor('brand/primary')} />}
                onPress={onBackPress}
                containerStyle={styles.actionButton}
              />
            </ConditionRenderer>
            <MyButton
              type="primary"
              text={primaryActionLabel}
              onPress={onPrimaryActionPress}
              containerStyle={styles.actionButton}
            />
          </MyView>
        </MyView>
      </MySurface>
    </ScrollView>
  )
}

export const NotFoundScreenView = memo(NotFoundScreenViewInner)
