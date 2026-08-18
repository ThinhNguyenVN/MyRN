import {
  PULL_TO_REFRESH_ARC_MAX,
  PULL_TO_REFRESH_MAX_PULL_VISUAL_PX,
  PULL_TO_REFRESH_OVERSCROLL_THRESHOLD,
} from './constants'
import { getPullRefreshArcPhase, getPullRefreshArcProgress } from './utils'

describe('pull refresh arc progress', () => {
  it('fills gradually — trigger distance is below full arc', () => {
    const atTrigger = getPullRefreshArcProgress(
      PULL_TO_REFRESH_OVERSCROLL_THRESHOLD,
      PULL_TO_REFRESH_OVERSCROLL_THRESHOLD,
      PULL_TO_REFRESH_MAX_PULL_VISUAL_PX,
    )
    expect(atTrigger).toBeLessThan(0.65)
  })

  it('reaches full arc only at max visual pull', () => {
    const atMax = getPullRefreshArcProgress(
      PULL_TO_REFRESH_MAX_PULL_VISUAL_PX,
      PULL_TO_REFRESH_OVERSCROLL_THRESHOLD,
      PULL_TO_REFRESH_MAX_PULL_VISUAL_PX,
    )
    expect(atMax).toBeCloseTo(PULL_TO_REFRESH_ARC_MAX, 2)
  })

  it('starts near zero on a short pull', () => {
    const early = getPullRefreshArcPhase(
      24,
      PULL_TO_REFRESH_OVERSCROLL_THRESHOLD,
      PULL_TO_REFRESH_MAX_PULL_VISUAL_PX,
    )
    expect(early).toBeLessThan(0.32)
  })
})
