import { isIos } from '@/constants/dimensions'
import { usePullToRefresh as usePullToRefreshAndroid } from './use-pull-to-refresh.android'
import { usePullToRefresh as usePullToRefreshIos } from './use-pull-to-refresh.ios'
import type { UsePullToRefreshOptions, UsePullToRefreshResult } from './utils'

const usePullToRefreshImpl = isIos ? usePullToRefreshIos : usePullToRefreshAndroid

export function usePullToRefresh(options: UsePullToRefreshOptions): UsePullToRefreshResult {
  return usePullToRefreshImpl(options)
}
