const PAGE_WINDOW = 5

export function getVisiblePages(page: number, maxPage: number): number[] {
  if (maxPage <= PAGE_WINDOW) {
    return Array.from({ length: maxPage }, (_, index) => index + 1)
  }
  let start = Math.max(1, page - Math.floor(PAGE_WINDOW / 2))
  let end = start + PAGE_WINDOW - 1
  if (end > maxPage) {
    end = maxPage
    start = Math.max(1, end - PAGE_WINDOW + 1)
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}
