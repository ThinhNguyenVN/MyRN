import { File as ExpoFile } from 'expo-file-system'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import { isNil } from 'lodash'

import { isWeb } from '@/constants/dimensions'

import type {
  BuildImageFormDataOptions,
  ImagePickErrorCode,
  PickedImage,
  PickImageOptions,
  PickImagesOptions,
  PickImagesResult,
} from './type'

/** Default client-side guard — server limits may differ per API. */
export const IMAGE_PICK_MAX_BYTES = 5 * 1024 * 1024

/** Chat attachment preview/bubble target — see {@link resizeImageIfNeeded}. */
export const IMAGE_RESIZE_MAX_EDGE = 900

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

  // Web: `asset.uri` is a fresh `blob:` object URL per pick, even for the exact same file
  // re-selected in a later dialog — never a stable identity. The underlying `File`'s own
  // name/size/lastModified are, so prefer those when present; native falls back to the
  // library `assetId` (stable across re-picks), then the asset uri as a last resort.
  const sourceId = asset.file
    ? `${asset.file.name}:${asset.file.size}:${asset.file.lastModified}`
    : asset.assetId || asset.uri

  return {
    uri: asset.uri,
    name: asset.fileName || guessName(asset.uri, mimeType),
    mimeType,
    size,
    file: asset.file,
    sourceId,
    width: asset.width || undefined,
    height: asset.height || undefined,
  }
}

/**
 * Converts every picked asset, but a single unsupported/oversized asset must not sink the
 * whole batch (e.g. one HEIC/GIF mixed into a 5-photo multi-select) — skip just that one and
 * keep going. Callers surface `skippedCount` to the user instead of silently losing everything.
 */
function assetsToPickedImages(
  assets: ImagePicker.ImagePickerAsset[],
  maxBytes: number,
): PickImagesResult {
  const images: PickedImage[] = []
  let skippedCount = 0

  for (const asset of assets) {
    try {
      images.push(assetToPickedImage(asset, maxBytes))
    } catch (error) {
      if (error instanceof ImagePickError) {
        skippedCount += 1
        continue
      }
      throw error
    }
  }

  return { images, skippedCount }
}

/** Shared `pickImage`/`pickImageFromCamera` flow: request permission, launch, validate. */
async function launchPicker(
  requestPermission: () => Promise<{ granted: boolean }>,
  launch: (options: ImagePicker.ImagePickerOptions) => Promise<ImagePicker.ImagePickerResult>,
  options: PickImageOptions,
): Promise<PickedImage> {
  // Browsers only open the native file dialog when `launch` runs synchronously within the
  // click's own call stack — expo-image-picker's web shim opens it via a dispatched click on
  // a hidden <input>. Web's permission check is an unconditional granted no-op (there's no
  // real permission to request), but `await`-ing it still costs a microtask hop, which is
  // enough for some browsers to drop the click's user-activation and silently no-op the
  // dialog — leaving the picker stuck in its loading state forever. Skip it on web so `launch`
  // is reached synchronously, in the same task as the original click.
  if (!isWeb) {
    const permission = await requestPermission()
    if (!permission.granted) {
      throw new ImagePickError('permission_denied')
    }
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
 * Opens the system / browser image library with multi-select enabled via `expo-image-picker`.
 * Same validation as {@link pickImage}, but a single unsupported/oversized asset in the batch
 * is skipped rather than failing the whole pick (see {@link assetsToPickedImages}) — callers
 * should tell the user when `skippedCount > 0`. Callers that must cap the total (e.g. MyChat's
 * 5-image limit) should pass `selectionLimit` and still defensively trim `images` — some
 * Android builds ignore `selectionLimit`.
 */
export async function pickImages(options: PickImagesOptions = {}): Promise<PickImagesResult> {
  if (!isWeb) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      throw new ImagePickError('permission_denied')
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: options.selectionLimit,
    quality: options.quality ?? 0.9,
  })

  if (result.canceled || !result.assets || result.assets.length === 0) {
    throw new ImagePickError('cancelled')
  }

  const maxBytes = options.maxBytes ?? IMAGE_PICK_MAX_BYTES
  return assetsToPickedImages(result.assets, maxBytes)
}

/**
 * Resizes `image` down to `maxEdge` on its longest side, preserving aspect ratio, when it's
 * larger than that. Images already at or under `maxEdge` are returned unchanged (never
 * upscaled). The resized copy is written to the cache directory — callers that discard a
 * resized image without using it should call {@link deletePickedImageIfTemp} to avoid leaving
 * it behind.
 *
 * Deliberately NOT wired into `pickImage`/`pickImageFromCamera`/`pickImages` — those are shared
 * by non-chat consumers (product photo / avatar forms) that should keep their original
 * resolution. Call this explicitly where a smaller display copy is actually wanted.
 */
export async function resizeImageIfNeeded(
  image: PickedImage,
  maxEdge: number = IMAGE_RESIZE_MAX_EDGE,
): Promise<PickedImage> {
  const { width, height } = image
  if (!width || !height || Math.max(width, height) <= maxEdge) {
    return image
  }

  const resizeAction =
    width >= height ? { resize: { width: maxEdge } } : { resize: { height: maxEdge } }
  const result = await manipulateAsync(image.uri, [resizeAction], {
    compress: 0.8,
    format: SaveFormat.JPEG,
  })

  return {
    ...image,
    uri: result.uri,
    mimeType: 'image/jpeg',
    size: 0,
    file: undefined,
    width: result.width,
    height: result.height,
    resizedTempUri: true,
  }
}

/**
 * Deletes the cache file behind `image` when it was created by {@link resizeImageIfNeeded}
 * (`resizedTempUri: true`). No-op for original library/camera/browser URIs — those are never
 * deleted here. Safe to call multiple times or on an already-deleted file.
 */
export function deletePickedImageIfTemp(image: PickedImage): void {
  if (!image.resizedTempUri) {
    return
  }
  try {
    const file = new ExpoFile(image.uri)
    if (file.exists) {
      file.delete()
    }
  } catch {
    // Best-effort cleanup — ignore failures (already gone, unsupported URI scheme, etc.).
  }
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
