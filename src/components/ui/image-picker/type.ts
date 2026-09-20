export type PickedImage = {
  uri: string
  name: string
  mimeType: string
  size: number
  /** Web: native `File` from expo-image-picker for FormData.append */
  file?: File
  /**
   * Stable identity for the picked asset — the library `assetId` when available, else the
   * original (pre-resize) `uri`. Survives {@link resizeImageIfNeeded} (which changes `uri`),
   * so callers can dedupe re-picks of the same photo. Not set by {@link pickedImageFromFile}
   * (web drag-and-drop has no stable asset id).
   */
  sourceId?: string
  /** Original asset dimensions, when the source provides them (picker library/camera assets do; web drag-and-drop does not). Needed by {@link resizeImageIfNeeded} to preserve aspect ratio. */
  width?: number
  height?: number
  /**
   * `true` when `uri` points to a resized copy this module wrote to the cache directory
   * (see {@link resizeImageIfNeeded}) — safe to delete with {@link deletePickedImageIfTemp}
   * once the image is no longer needed. `false`/`undefined` means `uri` is the original
   * library/camera asset URI and MUST NOT be deleted.
   */
  resizedTempUri?: boolean
}

export type ImagePickErrorCode =
  | 'permission_denied'
  | 'cancelled'
  | 'invalid_type'
  | 'too_large'
  | 'unavailable'

export type PickImageOptions = {
  /** Max bytes; default 5MB. When file size is unknown (some iOS assets), size check is skipped. */
  maxBytes?: number
  allowsEditing?: boolean
  quality?: number
}

export type PickImagesOptions = PickImageOptions & {
  /** Max assets the native/web picker lets the user select in this one call. */
  selectionLimit?: number
}

export type PickImagesResult = {
  images: PickedImage[]
  /** Assets the user picked that failed validation (unsupported type / too large) and were skipped instead of failing the whole pick. */
  skippedCount: number
}

export type BuildImageFormDataOptions = {
  /** Multipart field name. Default `file`. */
  fieldName?: string
}

export type ImagePickerFieldProps = {
  /** Preview URI (remote URL or local pending `file://` / blob). */
  imageUri?: string | null
  isUploading?: boolean
  errorMessage?: string | null
  emptyTitle: string
  emptyHint?: string
  clearAccessibilityLabel: string
  /** Web only: opens the browser file picker (click). Native shows the camera/library sheet instead. */
  onPick: () => void
  /** Clears the current preview. */
  onClear: () => void
  /** Preview only: no pick, drop, or clear. */
  readOnly?: boolean
  /**
   * Called with a validated {@link PickedImage} from web drag-and-drop, or from the
   * native camera/library choice sheet. When omitted, drop is ignored and the native
   * sheet's picks are silently dropped (click-to-pick via `onPick` still works on web).
   */
  onImagePicked?: (image: PickedImage) => void
  /** Errors from web drag-and-drop or the native camera/library pick (`ImagePickError`, etc.). */
  onPickError?: (error: unknown) => void
  /** Forwarded to {@link pickedImageFromFile} (web drop) and {@link pickImage}/{@link pickImageFromCamera} (native). */
  pickOptions?: PickImageOptions
  /** `square` (default): full-width rectangle, e.g. product photo. `circle`: fixed-size avatar. */
  shape?: 'square' | 'circle'
}
