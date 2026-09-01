import * as ImagePicker from 'expo-image-picker'
import { isNil } from 'lodash'

import type {
  BuildImageFormDataOptions,
  ImagePickErrorCode,
  PickedImage,
  PickImageOptions,
} from './type'

/** Default client-side guard — server limits may differ per API. */
export const IMAGE_PICK_MAX_BYTES = 5 * 1024 * 1024

const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])

export class ImagePickError extends Error {
  code: ImagePickErrorCode

  constructor(code: ImagePickErrorCode, message?: string) {
    super(message ?? code)
    this.code = code
    this.name = 'ImagePickError'
  }
}

function assertValidImage(mimeType: string, size: number, maxBytes: number) {
  const normalized = mimeType.toLowerCase()
  const allowed =
    ALLOWED_MIME.has(normalized) ||
    (normalized.startsWith('image/') &&
      (normalized.includes('jpeg') ||
        normalized.includes('jpg') ||
        normalized.includes('png') ||
        normalized.includes('gif') ||
        normalized.includes('webp')))

  if (!allowed) {
    throw new ImagePickError('invalid_type')
  }
  // Some iOS library assets omit fileSize — skip size guard when unknown.
  if (size > 0 && size > maxBytes) {
    throw new ImagePickError('too_large')
  }
}

function guessName(uri: string, mimeType: string): string {
  const fromUri = uri.split('/').pop()?.split('?')[0]
  if (fromUri && fromUri.includes('.')) {
    return fromUri
  }
  const ext = mimeType.includes('png')
    ? 'png'
    : mimeType.includes('gif')
      ? 'gif'
      : mimeType.includes('webp')
        ? 'webp'
        : 'jpg'
  return `image.${ext}`
}

function assetToPickedImage(asset: ImagePicker.ImagePickerAsset, maxBytes: number): PickedImage {
  const mimeType = asset.mimeType || 'image/jpeg'
  const size = asset.fileSize ?? 0
  assertValidImage(mimeType, size, maxBytes)

  return {
    uri: asset.uri,
    name: asset.fileName || guessName(asset.uri, mimeType),
    mimeType,
    size,
    file: asset.file,
  }
}

/** Shared `pickImage`/`pickImageFromCamera` flow: request permission, launch, validate. */
async function launchPicker(
  requestPermission: () => Promise<{ granted: boolean }>,
  launch: (options: ImagePicker.ImagePickerOptions) => Promise<ImagePicker.ImagePickerResult>,
  options: PickImageOptions,
): Promise<PickedImage> {
  const permission = await requestPermission()
  if (!permission.granted) {
    throw new ImagePickError('permission_denied')
  }

  const result = await launch({
    mediaTypes: ['images'],
    allowsEditing: options.allowsEditing ?? false,
    quality: options.quality ?? 0.9,
  })

  if (result.canceled || isNil(result.assets?.[0])) {
    throw new ImagePickError('cancelled')
  }

  return assetToPickedImage(result.assets[0], options.maxBytes ?? IMAGE_PICK_MAX_BYTES)
}

/**
 * Builds a {@link PickedImage} from a browser `File` (drag-and-drop / input).
 * Web-only — validates MIME + size with the same rules as {@link pickImage}.
 */
export function pickedImageFromFile(file: File, options: PickImageOptions = {}): PickedImage {
  const maxBytes = options.maxBytes ?? IMAGE_PICK_MAX_BYTES
  const mimeType = file.type || 'image/jpeg'
  assertValidImage(mimeType, file.size, maxBytes)

  return {
    uri: URL.createObjectURL(file),
    name: file.name || guessName(file.name || 'image', mimeType),
    mimeType,
    size: file.size,
    file,
  }
}

/**
 * Opens the system / browser image library via `expo-image-picker`.
 * Uses photo library on iOS/Android (not Files/document picker) and the
 * same ImagePicker API on web (asset may include `file` for FormData).
 */
export async function pickImage(options: PickImageOptions = {}): Promise<PickedImage> {
  return launchPicker(
    ImagePicker.requestMediaLibraryPermissionsAsync,
    ImagePicker.launchImageLibraryAsync,
    options,
  )
}

/**
 * Opens the device camera via `expo-image-picker`. Native (iOS/Android) only —
 * callers should not offer this on web.
 */
export async function pickImageFromCamera(options: PickImageOptions = {}): Promise<PickedImage> {
  return launchPicker(
    ImagePicker.requestCameraPermissionsAsync,
    ImagePicker.launchCameraAsync,
    options,
  )
}

/**
 * Builds multipart FormData for upload.
 * - Web: prefers `File` from the picker asset when present
 * - iOS/Android: appends `{ uri, name, type }` (React Native FormData shape)
 */
export function buildImageFormData(
  image: PickedImage,
  options: BuildImageFormDataOptions = {},
): FormData {
  const fieldName = options.fieldName ?? 'file'
  const formData = new FormData()

  if (image.file) {
    formData.append(fieldName, image.file, image.name)
    return formData
  }

  // React Native FormData accepts { uri, name, type } at runtime (not a web Blob).
  const nativeFile = {
    uri: image.uri,
    name: image.name,
    type: image.mimeType,
  }
  formData.append(fieldName, nativeFile as unknown as Blob)

  return formData
}
