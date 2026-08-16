import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  buildImageFormData,
  ImagePickError,
  pickImage,
  type PickedImage,
} from '@/components/ui/image-picker'
import { Toast } from '@/components/ui/toast'
import { bumpProductImageVersion, productImageDisplayUrl } from '@/utils/product-image-url'

export type FormEntityImageUploadResult = {
  image?: string | null
  updated?: string | null
}

export type UseFormEntityImageParams = {
  entityId?: string
  isEditMode: boolean
  detailImage?: string | null
  i18nPrefix: string
  logLabel: string
  uploadImage: (id: string, formData: FormData) => Promise<FormEntityImageUploadResult>
}

export function useFormEntityImage({
  entityId,
  isEditMode,
  detailImage,
  i18nPrefix,
  logLabel,
  uploadImage,
}: UseFormEntityImageParams) {
  const { t } = useTranslation()

  const [isUploading, setIsUploading] = useState(false)
  const [pendingImage, setPendingImage] = useState<PickedImage | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null)
  const [imageCleared, setImageCleared] = useState(false)
  const [imageSeeded, setImageSeeded] = useState(false)

  useEffect(() => {
    setPendingImage(null)
    setRemoteImageUrl(null)
    setImageCleared(false)
    setImageSeeded(false)
    setImageError(null)
  }, [entityId])

  useEffect(() => {
    if (imageSeeded || imageCleared || pendingImage) {
      return
    }
    if (detailImage) {
      setRemoteImageUrl(detailImage)
      setImageSeeded(true)
    }
  }, [detailImage, imageCleared, imageSeeded, pendingImage])

  const mapPickError = useCallback(
    (err: unknown) => {
      if (err instanceof ImagePickError) {
        if (err.code === 'cancelled') {
          return null
        }
        return t(`${i18nPrefix}.errors.${err.code}`)
      }
      return t(`${i18nPrefix}.errors.unavailable`)
    },
    [i18nPrefix, t],
  )

  const uploadForId = useCallback(
    async (id: string, image: PickedImage) => {
      setIsUploading(true)
      setImageError(null)
      try {
        const formData = buildImageFormData(image, { fieldName: 'file' })
        const updated = await uploadImage(id, formData)
        const version = bumpProductImageVersion(id)
        const nextUrl =
          productImageDisplayUrl(updated.image, updated.updated, id) ??
          (updated.image ? `${updated.image.split('?')[0]}?v=${version}` : null)
        setRemoteImageUrl(nextUrl)
        setPendingImage(null)
        setImageCleared(false)
        setImageSeeded(true)
        Toast.show({ text: t(`${i18nPrefix}.uploadSuccess`), type: 'success' })
        return true
      } catch (err) {
        console.error(`${logLabel} image upload failed`, err)
        const message = t(`${i18nPrefix}.uploadError`)
        setImageError(message)
        Toast.show({ text: message, type: 'error' })
        return false
      } finally {
        setIsUploading(false)
      }
    },
    [i18nPrefix, logLabel, t, uploadImage],
  )

  const applyPickedImage = useCallback(
    async (picked: PickedImage) => {
      setPendingImage(picked)
      setImageCleared(false)
      setImageError(null)
      if (isEditMode && entityId) {
        await uploadForId(entityId, picked)
      }
    },
    [entityId, isEditMode, uploadForId],
  )

  const handlePickError = useCallback(
    (err: unknown) => {
      const message = mapPickError(err)
      if (message) {
        setImageError(message)
      }
    },
    [mapPickError],
  )

  const handlePickImage = useCallback(async () => {
    try {
      const picked = await pickImage()
      await applyPickedImage(picked)
    } catch (err) {
      handlePickError(err)
    }
  }, [applyPickedImage, handlePickError])

  const handleImagePicked = useCallback(
    (picked: PickedImage) => {
      void applyPickedImage(picked)
    },
    [applyPickedImage],
  )

  const handleClearImage = useCallback(() => {
    setPendingImage(null)
    setRemoteImageUrl(null)
    setImageCleared(true)
    setImageError(null)
  }, [])

  return {
    isUploading,
    pendingImage,
    imageError,
    remoteImageUrl,
    uploadForId,
    handlePickImage,
    handleImagePicked,
    handlePickError,
    handleClearImage,
    setImageError,
  }
}
