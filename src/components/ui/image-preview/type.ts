export type ImagePreviewProps = {
  images: string[]
  activeIndex: number
  visible: boolean
  label: string
  onClose: () => void
  onIndexChange: (index: number) => void
}
