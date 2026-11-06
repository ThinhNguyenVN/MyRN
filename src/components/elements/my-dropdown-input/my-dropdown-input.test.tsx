import { fireEvent, screen } from '@testing-library/react-native'
import { Text, View } from 'react-native'

import { renderWithTheme } from '@/test/render-with-theme'

import MyDropdownInput from './my-dropdown-input'
import type { DropdownOption } from './type'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}))

jest.mock('@/components/ui/native-fullscreen-modal', () => ({ NativeFullscreenModal: () => null }))
jest.mock('@/components/ui/trigger-modal', () => ({ TriggerModal: () => null }))

jest.mock('@/components/elements/my-image', () => ({ __esModule: true, default: () => null }))

// Render sheet content inline so option rows are queryable without native sheet machinery.
jest.mock('@/components/elements/my-bottom-sheet', () => {
  const { View: MockView } = jest.requireActual('react-native')
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <MockView>{children}</MockView>,
  }
})

const withDefault: DropdownOption[] = [
  { value: '', label: 'Default price' },
  { value: '7', label: 'Wholesale' },
]
const withoutDefault: DropdownOption[] = [
  { value: '7', label: 'Wholesale' },
  { value: '8', label: 'Retail' },
]

function renderDropdown(options: DropdownOption[], value: string, onValueChange = jest.fn()) {
  renderWithTheme(
    <View>
      <MyDropdownInput options={options} value={value} onValueChange={onValueChange} preferSheet />
    </View>,
  )
  return onValueChange
}

function optionRow(label: string) {
  return screen
    .getAllByRole('radio')
    .find((row) => row.findAllByType(Text).some((node) => node.props.children === label))
}

describe('MyDropdownInput empty-value option', () => {
  it('ticks the "" option when value is ""', () => {
    renderDropdown(withDefault, '')
    fireEvent.press(screen.getByDisplayValue('Default price'))
    expect(optionRow('Default price')?.props.accessibilityState.checked).toBe(true)
    expect(optionRow('Wholesale')?.props.accessibilityState.checked).toBe(false)
  })

  it('ticks nothing when there is no "" option', () => {
    renderDropdown(withoutDefault, '')
    fireEvent.press(screen.getByPlaceholderText('components.dropdownSelect'))
    screen.getAllByRole('radio').forEach((row) => {
      expect(row.props.accessibilityState.checked).toBe(false)
    })
  })

  it('does not offer a clear action when the selected value is ""', () => {
    renderDropdown(withDefault, '')
    fireEvent.press(screen.getByDisplayValue('Default price'))
    expect(screen.queryByLabelText('components.dropdownClear')).toBeNull()
  })

  it('calls onValueChange("") when re-picking the "" option', () => {
    const onValueChange = renderDropdown(withDefault, '7')
    fireEvent.press(screen.getByDisplayValue('Wholesale'))
    fireEvent.press(optionRow('Default price') as never)
    expect(onValueChange).toHaveBeenCalledWith('')
  })
})
