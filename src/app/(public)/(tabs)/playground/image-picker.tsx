import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import {
  ImagePickError,
  ImagePickerField,
  pickImage,
  type PickedImage,
} from '@/components/ui/image-picker'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function ImagePickerScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const applyPicked = useCallback((image: PickedImage) => {
    setImageUri(image.uri)
  }, [])

  const handlePickError = useCallback(
    (error: unknown) => {
      if (error instanceof ImagePickError && error.code === 'cancelled') {
        return
      }
      const message = error instanceof Error ? error.message : t('components.imageError')
      Toast.show({ text: message, type: 'error' })
    },
    [t],
  )

  const handlePick = useCallback(async () => {
    setIsUploading(true)
    try {
      const picked = await pickImage()
      applyPicked(picked)
    } catch (error) {
      handlePickError(error)
    } finally {
      setIsUploading(false)
    }
  }, [applyPicked, handlePickError])

  const handleClear = useCallback(() => {
    setImageUri(null)
  }, [])

  return (
    <MyKeyboardAvoiding.ScrollView showToolbar contentContainerStyle={styles.screenContent}>
      <MyText typography="body" color="text/active/secondary" style={styles.introText}>
        {t('playground.imagePickerIntro')}
      </MyText>
      <ImagePickerField
        imageUri={imageUri}
        isUploading={isUploading}
        emptyTitle={t('playground.imagePickerEmptyTitle')}
        emptyHint={t('playground.imagePickerEmptyHint')}
        clearAccessibilityLabel={t('playground.imagePickerClear')}
        onPick={handlePick}
        onClear={handleClear}
        onImagePicked={applyPicked}
        onPickError={handlePickError}
      />
    </MyKeyboardAvoiding.ScrollView>
  )
}
