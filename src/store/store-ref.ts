import type { Store } from '@reduxjs/toolkit'

let _store: Store | null = null

export function injectStore(store: Store) {
  _store = store
}

export function getStore(): Store {
  if (!_store) {
    throw new Error('Redux store has not been injected yet')
  }
  return _store
}

export function tryGetStore(): Store | null {
  return _store
}
