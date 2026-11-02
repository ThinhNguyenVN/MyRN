import { fireEvent, screen } from '@testing-library/react-native'
import { useState } from 'react'

import { renderWithTheme } from '@/test/render-with-theme'

import { OtpCodeInput } from './otp-code-input'

function Harness({
  onComplete,
  disabled,
  length,
}: {
  onComplete: jest.Mock
  disabled?: boolean
  length?: number
}) {
  const [value, setValue] = useState('')
  return (
    <OtpCodeInput
      value={value}
      onChangeText={setValue}
      onComplete={onComplete}
      disabled={disabled}
      length={length}
      accessibilityLabel="otp"
    />
  )
}

describe('OtpCodeInput', () => {
  it('keeps digits only and shows them in the cells', () => {
    const onComplete = jest.fn()
    renderWithTheme(<Harness onComplete={onComplete} />)

    fireEvent.changeText(screen.getByLabelText('otp'), '1a2-3')

    expect(screen.getByLabelText('otp').props.value).toBe('123')
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('completes on a pasted code with spaces and caps it at 6 digits', () => {
    const onComplete = jest.fn()
    renderWithTheme(<Harness onComplete={onComplete} />)

    fireEvent.changeText(screen.getByLabelText('otp'), '123 4567')

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('honours a custom length', () => {
    const onComplete = jest.fn()
    renderWithTheme(<Harness onComplete={onComplete} length={4} />)

    fireEvent.changeText(screen.getByLabelText('otp'), '98765')

    expect(onComplete).toHaveBeenCalledWith('9876')
  })

  it('is not editable when disabled', () => {
    renderWithTheme(<Harness onComplete={jest.fn()} disabled />)

    expect(screen.getByLabelText('otp').props.editable).toBe(false)
  })
})
