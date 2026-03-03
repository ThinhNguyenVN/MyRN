import type { ToastOptions, ToastRef } from './type'

let refHolder: { current: ToastRef | null } | null = null

export function setToastRef(ref: { current: ToastRef | null } | null) {
  refHolder = ref
}

export const Toast = {
  show(options: ToastOptions) {
    const api = refHolder?.current
    if (!api) {
      if (__DEV__) {
        console.warn(
          '[Toast] ToastRoot not mounted. Add <ToastRoot ref={...} /> and setToastRef(ref) in your app root.',
        )
      }
      return
    }
    api.show(options)
  },

  hide() {
    refHolder?.current?.hide()
  },
}
