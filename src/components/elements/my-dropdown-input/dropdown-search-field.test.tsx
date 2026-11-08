import { fireEvent, screen } from '@testing-library/react-native'

import { renderWithTheme } from '@/test/render-with-theme'

import { DropdownSearchField } from './dropdown-search-field'

// The real search field wraps the bottom-sheet text input, which is not available under jest.
jest.mock('@/components/elements/my-search-input', () => {
  const { TextInput: MockInput } = jest.requireActual('react-native')
  return {
    __esModule: true,
    default: ({
      value,
      onChangeText,
      placeholder,
    }: {
      value: string
      onChangeText: (text: string) => void
      placeholder: string
    }) => <MockInput value={value} onChangeText={onChangeText} placeholder={placeholder} />,
  }
})

describe('DropdownSearchField', () => {
  it('starts with the initial value', () => {
    renderWithTheme(
      <DropdownSearchField initialValue="Box" onChangeText={jest.fn()} placeholder="search" />,
    )
    expect(screen.getByPlaceholderText('search').props.value).toBe('Box')
  })

  it('shows typed text from its own state even when the parent never re-renders', () => {
    const onChangeText = jest.fn()
    renderWithTheme(
      <DropdownSearchField initialValue="" onChangeText={onChangeText} placeholder="search" />,
    )
    const input = screen.getByPlaceholderText('search')
    fireEvent.changeText(input, 'm')
    fireEvent.changeText(input, 'mụ')
    fireEvent.changeText(input, 'mục')
    expect(screen.getByPlaceholderText('search').props.value).toBe('mục')
    expect(onChangeText).toHaveBeenLastCalledWith('mục')
    expect(onChangeText).toHaveBeenCalledTimes(3)
  })
})
