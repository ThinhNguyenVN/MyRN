import { useCallback } from 'react'

import { initAuthThunk } from '@/features/auth/auth-thunks'
import { useAppDispatch } from '@/store/hooks'

export function useInitAuth() {
  const dispatch = useAppDispatch()

  const initAuth = useCallback(async () => {
    await dispatch(initAuthThunk())
  }, [dispatch])

  return { initAuth }
}
