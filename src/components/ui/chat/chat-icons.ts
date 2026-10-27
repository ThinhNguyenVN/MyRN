import type MyIcon from '@/components/elements/my-icon'

type IoniconName = React.ComponentProps<typeof MyIcon>['name']

/** Gateway icon names (the platform icon set, contract v4) → Ionicons. */
export const CHAT_ICONS: Record<string, IoniconName> = {
  chart: 'bar-chart-outline',
  star: 'star-outline',
  check: 'checkmark-done-outline',
  box: 'cube-outline',
  plus: 'add-circle-outline',
  inbound: 'download-outline',
  count: 'clipboard-outline',
  cart: 'cart-outline',
  search: 'search-outline',
  me: 'person-outline',
  list: 'list-outline',
}

/** Shown for a name this build does not know yet. */
export const FALLBACK_CHAT_ICON: IoniconName = 'flash-outline'

export function chatIconName(name: string): IoniconName {
  return CHAT_ICONS[name] ?? FALLBACK_CHAT_ICON
}
