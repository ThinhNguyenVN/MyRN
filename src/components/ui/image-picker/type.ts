export type PickedImage = {
  uri: string
  name: string
  mimeType: string
  size: number
  /** Web: native `File` from expo-image-picker for FormData.append */
  file?: File
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
