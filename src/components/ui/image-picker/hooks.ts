import { useCallback, useEffect, useRef, useState, type RefCallback } from 'react'

import { isWeb } from '@/constants/dimensions'

import type { PickedImage, PickImageOptions } from './type'
import { pickedImageFromFile } from './utils'

export type UseImageDropZoneParams = {
  disabled?: boolean
  pickOptions?: PickImageOptions
  onImagePicked: (image: PickedImage) => void
  onError?: (error: unknown) => void
}

/**
 * Web-only drag-and-drop via native DOM listeners.
 * RN Web does not reliably forward React `onDrag*` props on `View`, which lets
 * the browser open the dropped file in a new tab.
 */
export function useImageDropZone({
  disabled = false,
  pickOptions,
  onImagePicked,
  onError,
}: UseImageDropZoneParams) {
  const [isDragging, setIsDragging] = useState(false)
  const [hostNode, setHostNode] = useState<HTMLElement | null>(null)
  const pickOptionsRef = useRef(pickOptions)
  const onImagePickedRef = useRef(onImagePicked)
  const onErrorRef = useRef(onError)

  pickOptionsRef.current = pickOptions
  onImagePickedRef.current = onImagePicked
  onErrorRef.current = onError

  const resetDrag = useCallback(() => {
    setIsDragging(false)
  }, [])

  const hostRef = useCallback<RefCallback<HTMLDivElement>>((node) => {
    setHostNode(node)
  }, [])

  useEffect(() => {
    if (!isWeb || disabled || !hostNode) {
      resetDrag()
      return undefined
    }

    const preventWindowNavigation = (event: DragEvent) => {
      event.preventDefault()
    }

    const armWindowGuards = () => {
      window.addEventListener('dragover', preventWindowNavigation)
      window.addEventListener('drop', preventWindowNavigation)
    }

    const disarmWindowGuards = () => {
      window.removeEventListener('dragover', preventWindowNavigation)
      window.removeEventListener('drop', preventWindowNavigation)
    }

    const onDragEnter = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(true)
      armWindowGuards()
    }

    const onDragLeave = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      const related = event.relatedTarget
      if (related instanceof Node && hostNode.contains(related)) {
        return
      }
      setIsDragging(false)
      disarmWindowGuards()
    }

    const onDragOver = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy'
      }
      setIsDragging(true)
    }

    const onDrop = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      disarmWindowGuards()
      resetDrag()

      const file = event.dataTransfer?.files?.[0]
      if (!file) {
        return
      }

      try {
        const picked = pickedImageFromFile(file, pickOptionsRef.current)
        onImagePickedRef.current(picked)
      } catch (error) {
        onErrorRef.current?.(error)
      }
    }

    hostNode.addEventListener('dragenter', onDragEnter)
    hostNode.addEventListener('dragleave', onDragLeave)
    hostNode.addEventListener('dragover', onDragOver)
    hostNode.addEventListener('drop', onDrop)

    return () => {
      hostNode.removeEventListener('dragenter', onDragEnter)
      hostNode.removeEventListener('dragleave', onDragLeave)
      hostNode.removeEventListener('dragover', onDragOver)
      hostNode.removeEventListener('drop', onDrop)
      disarmWindowGuards()
      resetDrag()
    }
  }, [disabled, hostNode, resetDrag])

  return {
    isDragging: isWeb && !disabled ? isDragging : false,
    hostRef,
  }
}
