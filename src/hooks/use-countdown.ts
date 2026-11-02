import { useEffect, useState } from 'react'

function secondsUntil(targetAt: number | null): number {
  if (targetAt === null) return 0
  return Math.max(0, Math.ceil((targetAt - Date.now()) / 1000))
}

/**
 * Whole seconds left until `targetAt` (epoch ms), ticking once a second; `0` when past or `null`.
 * Uses the absolute time, so it stays right after the app was in the background.
 */
export function useCountdown(targetAt: number | null): number {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(targetAt))

  useEffect(() => {
    setSecondsLeft(secondsUntil(targetAt))
    if (secondsUntil(targetAt) === 0) return undefined
    const id = setInterval(() => {
      const next = secondsUntil(targetAt)
      setSecondsLeft(next)
      if (next === 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [targetAt])

  return secondsLeft
}

/** `75` → `1:15`. */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
