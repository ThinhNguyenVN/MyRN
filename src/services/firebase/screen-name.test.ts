import { toScreenName } from './screen-name'

describe('toScreenName', () => {
  it('drops route groups and keeps dynamic segment patterns', () => {
    expect(toScreenName(['(private)', 'todo', '[id]'])).toBe('/todo/[id]')
    expect(toScreenName(['(public)', '(tabs)', 'playground'])).toBe('/playground')
  })

  it('maps the root route to /', () => {
    expect(toScreenName([])).toBe('/')
    expect(toScreenName(['(public)', '(tabs)'])).toBe('/')
  })
})
