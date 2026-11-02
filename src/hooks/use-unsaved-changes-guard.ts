import { useNavigation } from 'expo-router'
import { usePreventRemove } from 'expo-router/react-navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { unsavedChanges } from './unsaved-changes-registry'

/**
 * Asks "Stay / Discard" before leaving a screen whose form has unsaved changes:
 * - stack removal (header/in-app Back, Android back, iOS swipe, `router.back/replace`) via
 *   `usePreventRemove`;
 * - lateral navigation (sidebar, drawer, bell, shortcuts) via `unsavedChanges.confirmLeave()`;
 * - web back/forward and tab close/reload via the browser guard.
 *
 * Call `allowLeave()` right before navigating away after a successful save or delete: the form is
 * still dirty at that point. After "Discard" or `allowLeave()` the guard stays off until the screen
 * is focused again (a push keeps it mounted underneath).
 */
export function useUnsavedChangesGuard(isDirty: boolean): { allowLeave: () => void } {
  const navigation = useNavigation()
  const [released, setReleased] = useState(false)
  const releasedRef = useRef(false)
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  const allowLeave = useCallback(() => {
    releasedRef.current = true
    setReleased(true)
    unsavedChanges.refresh()
  }, [])

  useEffect(
    () =>
      unsavedChanges.register({
        isActive: () => isDirtyRef.current && !releasedRef.current,
        release: allowLeave,
      }),
    [allowLeave],
  )

  useEffect(() => {
    unsavedChanges.refresh()
  }, [isDirty, released])

  useEffect(
    () =>
      navigation.addListener('focus', () => {
        if (!releasedRef.current) return
        releasedRef.current = false
        setReleased(false)
      }),
    [navigation],
  )

  usePreventRemove(isDirty && !released, ({ data }) => {
    // `allowLeave()` was called in this same tick, before the re-render turned prevention off.
    if (releasedRef.current) {
      navigation.dispatch(data.action)
      return
    }
    void unsavedChanges.confirmDiscard().then((confirmed) => {
      if (!confirmed) return
      allowLeave()
      navigation.dispatch(data.action)
    })
  })

  return { allowLeave }
}
