/**
 * Native: no browser history or tab to guard; back/gesture is covered by `usePreventRemove`.
 * The web build (`unsaved-changes-browser.web.ts`) handles `beforeunload` and back/forward.
 */
export function installBrowserLeaveGuard(): void {}

export function syncBrowserLeaveGuard(
  _active: boolean,
  _confirmLeave: () => Promise<boolean>,
): void {}
