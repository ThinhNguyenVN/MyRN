export type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPrev: () => void
  onNext: () => void
  onPageChange: (page: number) => void
}

export type PaginationPageButtonProps = {
  pageNumber: number
  active: boolean
  onPress: (page: number) => void
}
