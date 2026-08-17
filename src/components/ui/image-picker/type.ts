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
  /** Multipart field name used by {@link buildImageFormData}. Default `file`. */
  formField?: string
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
  /** Opens the system/browser picker (click / tap). */
  onPick: () => void
  /** Clears the current preview. */
  onClear: () => void
  /** Preview only: no pick, drop, or clear. */
  readOnly?: boolean
  /**
   * Web drag-and-drop: called with a validated {@link PickedImage}.
   * When omitted, drop is ignored (click-to-pick still works).
   */
  onImagePicked?: (image: PickedImage) => void
  /** Web drag-and-drop validation / read errors (`ImagePickError`, etc.). */
  onPickError?: (error: unknown) => void
  /** Forwarded to {@link pickedImageFromFile} for drop validation. */
  pickOptions?: PickImageOptions
}
