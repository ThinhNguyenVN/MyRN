import { fireEvent } from '@testing-library/react-native'

import { renderWithTheme } from '@/test/render-with-theme'

import MySegment from './my-segment'

describe('MySegment', () => {
  it('shows option badges and reads them out with the label', () => {
    const onChange = jest.fn()
    const view = renderWithTheme(
      <MySegment
        options={[
          { value: 'month', label: 'Tháng' },
          { value: 'year', label: 'Năm', badge: '-17%' },
        ]}
        value="month"
        onChange={onChange}
      />,
    )
    expect(view.getByText('-17%')).toBeTruthy()
    fireEvent.press(view.getByLabelText('Năm -17%'))
    expect(onChange).toHaveBeenCalledWith('year')
  })

  it('does not report the option already selected', () => {
    const onChange = jest.fn()
    const view = renderWithTheme(
      <MySegment
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        value="a"
        onChange={onChange}
      />,
    )
    fireEvent.press(view.getByLabelText('A'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
