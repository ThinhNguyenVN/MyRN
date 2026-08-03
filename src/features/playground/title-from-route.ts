export function titleFromRoute(routeName: string): string {
  const routeParts = routeName.split('/').filter(Boolean)
  if (routeParts[routeParts.length - 1] === 'index' && routeParts.length > 1) {
    routeParts.pop()
  }
  const normalizedRouteName = routeParts[routeParts.length - 1] ?? ''

  const titleKeys: Record<string, string> = {
    toast: 'playground.toastAndConfirmation',
    'swipeable-item': 'playground.swipeableItem',
    'my-list': 'playground.linksMyList',
    'image-slider': 'playground.linksImageSlider',
    collapsible: 'playground.linksCollapsible',
    spinner: 'playground.linksSpinner',
    surface: 'playground.linksSurface',
    divider: 'playground.linksDivider',
    card: 'playground.linksCard',
    'empty-state': 'playground.linksEmptyState',
    'error-state': 'playground.linksErrorState',
    skeleton: 'playground.linksSkeleton',
    'search-input': 'playground.linksSearchInput',
  }

  const mapped = titleKeys[normalizedRouteName]
  if (mapped) return mapped

  return normalizedRouteName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
