import { isNil } from 'lodash'

/** Reads a user-facing message from an API error payload (`unwrap()` rejection) without leaking
 * internal JS error messages (`Error`) to the user. */
export function getApiFailureMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return fallback
  }
  if (typeof error === 'object' && !isNil(error) && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }
  return fallback
}
