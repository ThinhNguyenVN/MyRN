import { useCallback, useEffect, useMemo, useState } from 'react'
import * as Font from 'expo-font'

import { useInitAuth } from '@/features/auth/use-init-auth'
import { Fonts } from '@/configs/themes'

type AppInitTask = {
  name: string
  run: () => Promise<void>
}

export function useAppInit() {
  const { initAuth } = useInitAuth()
  const [isInitializing, setIsInitializing] = useState(true)
  const [initErrors, setInitErrors] = useState<string[]>([])

  const initFonts = useCallback(async () => {
    await Font.loadAsync(Fonts)
  }, [])

  const initNotifications = useCallback(async () => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500)
    })
  }, [])

  const initTasks = useMemo<AppInitTask[]>(
    () => [
      { name: 'auth', run: initAuth },
      { name: 'fonts', run: initFonts },
      { name: 'notifications', run: initNotifications },
    ],
    [initAuth, initFonts, initNotifications],
  )

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const results = await Promise.allSettled(initTasks.map((task) => task.run()))
      const failedTaskNames = results.flatMap((result, idx) =>
        result.status === 'rejected' ? [initTasks[idx]?.name ?? `task-${idx}`] : [],
      )
      if (isMounted) {
        setInitErrors(failedTaskNames)
        setIsInitializing(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [initTasks])

  return {
    isInitializing,
    isInitialized: !isInitializing,
    initErrors,
  }
}
