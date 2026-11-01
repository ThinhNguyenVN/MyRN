/** GA rejects `undefined` param values, so they are dropped. */
export function definedParams(params: object | undefined): Record<string, unknown> | undefined {
  if (!params) return undefined
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined))
}
