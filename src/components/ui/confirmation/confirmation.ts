import type { ConfirmationInput, ConfirmationOptions, ConfirmationRef } from './type'

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

  /**
   * Confirm with a text input (e.g. an optional cancel reason). Resolves with the trimmed text
   * (may be `''`) when confirmed, `null` when dismissed.
   */
  async prompt(
    options: ConfirmationOptions & { input: ConfirmationInput },
  ): Promise<string | null> {
    const api = refHolder?.current
    if (!api) {
      throw new Error(
        '[Confirmation] ConfirmationRoot not mounted. Add <ConfirmationRoot ref={...} /> to your app.',
      )
    }
    const confirmed = await api.show(options)
    return confirmed ? api.lastInput() : null
  },

  hide() {
    refHolder?.current?.hide()
  },
}
