import { getApiFailureMessage } from './api-error'

describe('getApiFailureMessage', () => {
  it('does not leak JavaScript Error messages to the user', () => {
    expect(
      getApiFailureMessage(
        new Error('Image.default.resolveAssetSource is not a function'),
        'fallback',
      ),
    ).toBe('fallback')
  })

  it('keeps API failure messages from unwrap payloads', () => {
    expect(
      getApiFailureMessage(
        { status: 422, errorCode: 'VALIDATION', message: 'Missing required field' },
        'fallback',
      ),
    ).toBe('Missing required field')
  })

  it('falls back when payload has no usable message', () => {
    expect(getApiFailureMessage({ status: 500 }, 'fallback')).toBe('fallback')
    expect(getApiFailureMessage(null, 'fallback')).toBe('fallback')
    expect(getApiFailureMessage('plain string error', 'fallback')).toBe('fallback')
  })
})
