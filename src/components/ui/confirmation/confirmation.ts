import type { ConfirmationOptions, ConfirmationRef } from './type'

let refHolder: { current: ConfirmationRef | null } | null = null

export function setConfirmationRef(ref: { current: ConfirmationRef | null } | null) {
  refHolder = ref
}

export const Confirmation = {
  async confirm(options: ConfirmationOptions): Promise<boolean> {
    const api = refHolder?.current
    if (!api) {
      throw new Error(
        '[Confirmation] ConfirmationRoot not mounted. Add <ConfirmationRoot ref={...} /> to your app.',
      )
    }
    return api.show(options)
  },

  hide() {
    refHolder?.current?.hide()
  },
}
