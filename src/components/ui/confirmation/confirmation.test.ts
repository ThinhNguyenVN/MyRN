import { Confirmation, setConfirmationRef } from './confirmation'

function mountFake(confirmed: boolean, typed: string) {
  const show = jest.fn().mockResolvedValue(confirmed)
  setConfirmationRef({ current: { show, hide: jest.fn(), lastInput: () => typed } })
  return show
}

describe('Confirmation.prompt', () => {
  afterEach(() => setConfirmationRef(null))

  it('returns the typed text when confirmed (empty allowed)', async () => {
    const show = mountFake(true, 'Khách đổi ý')
    const input = { title: 'Lý do' }
    await expect(Confirmation.prompt({ title: 'Huỷ?', input })).resolves.toBe('Khách đổi ý')
    expect(show).toHaveBeenCalledWith(expect.objectContaining({ input }))
    mountFake(true, '')
    await expect(Confirmation.prompt({ title: 'Huỷ?', input })).resolves.toBe('')
  })

  it('returns null when dismissed', async () => {
    mountFake(false, 'ignored')
    await expect(Confirmation.prompt({ title: 'Huỷ?', input: {} })).resolves.toBeNull()
  })
})
