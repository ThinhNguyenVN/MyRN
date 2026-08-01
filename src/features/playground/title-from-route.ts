export function titleFromRoute(routeName: string): string {
  const routeParts = routeName.split('/').filter(Boolean)
  if (routeParts[routeParts.length - 1] === 'index' && routeParts.length > 1) {
    routeParts.pop()
  }
  const normalizedRouteName = routeParts[routeParts.length - 1] ?? ''

  if (normalizedRouteName === 'toast') return 'playground.toastAndConfirmation'
  if (normalizedRouteName === 'swipeable-item') return 'playground.swipeableItem'
  if (normalizedRouteName === 'my-list') return 'playground.linksMyList'

  return normalizedRouteName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
