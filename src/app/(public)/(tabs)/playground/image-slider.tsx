import { useMemo } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ImageSlider } from '@/components/ui/image-slider'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

const SLIDER_IMAGES = [
  'https://picsum.photos/800/500?random=31',
  'https://picsum.photos/800/500?random=32',
  'https://picsum.photos/800/500?random=33',
]

export default function ImageSliderPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const label = useMemo(() => t('playground.imageSliderLabel'), [t])

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.imageSliderIntro')}
      </MyText>

      <MyView style={styles.imageSliderWrap}>
        <ImageSlider images={SLIDER_IMAGES} label={label} aspectRatio={16 / 10} />
      </MyView>
    </ScrollView>
  )
}
