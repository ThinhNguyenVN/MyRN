import { withFirebase, withFirebaseAsync } from './safe-call'

export function toError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  try {
    return new Error(JSON.stringify(error))
  } catch {
    return new Error(String(error))
  }
}

/**
 * Records a non-fatal error. Fatal JS errors and native crashes are captured automatically.
 * `context` is added as a breadcrumb log line right before the error.
 */
export function recordError(error: unknown, context?: string): void {
  withFirebase('recordError', undefined, ({ crashlytics }) => {
    const instance = crashlytics.getCrashlytics()
    if (context) crashlytics.log(instance, context)
    crashlytics.recordError(instance, toError(error))
  })
}

/** Breadcrumb attached to the next crash / non-fatal report. */
export function crashLog(message: string): void {
  withFirebase('crashLog', undefined, ({ crashlytics }) => {
    crashlytics.log(crashlytics.getCrashlytics(), message)
  })
}

export async function setCrashUserId(userId: string | null): Promise<void> {
  await withFirebaseAsync('setCrashUserId', null, ({ crashlytics }) =>
    crashlytics.setUserId(crashlytics.getCrashlytics(), userId ?? ''),
  )
}
