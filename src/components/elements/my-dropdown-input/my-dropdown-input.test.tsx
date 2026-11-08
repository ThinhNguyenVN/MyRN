import { act, fireEvent, screen } from '@testing-library/react-native'
import { Text, View } from 'react-native'

import { renderWithTheme } from '@/test/render-with-theme'

import MyDropdownInput from './my-dropdown-input'
import type { DropdownOption } from './type'
import { DROPDOWN_SEARCH_DEBOUNCE_MS } from './utils'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}))

jest.mock('@/components/ui/native-fullscreen-modal', () => ({ NativeFullscreenModal: () => null }))
jest.mock('@/components/ui/trigger-modal', () => ({ TriggerModal: () => null }))

jest.mock('@/components/elements/my-image', () => ({ __esModule: true, default: () => null }))

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

describe('MyDropdownInput quick-create', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  function renderRemote(
    onCreateOption: jest.Mock | undefined,
    extra: {
      fetching?: boolean
      searchedQuery?: string
      selectedOptions?: DropdownOption[]
    } = {},
  ) {
    const onValueChange = jest.fn()
    renderWithTheme(
      <View>
        <MyDropdownInput
          options={withoutDefault}
          value=""
          onValueChange={onValueChange}
          onSearchChange={jest.fn()}
          onCreateOption={onCreateOption}
          preferSheet
          {...extra}
        />
      </View>,
    )
    fireEvent.press(screen.getByPlaceholderText('components.dropdownSelect'))
    return onValueChange
  }

  function typeSearch(text: string, { settle = true } = {}) {
    fireEvent.changeText(screen.getByPlaceholderText('components.dropdownSearch'), text)
    if (settle) {
      act(() => {
        jest.advanceTimersByTime(DROPDOWN_SEARCH_DEBOUNCE_MS)
      })
    }
  }

  const createRow = () => screen.queryByLabelText('components.dropdownCreate')

  it('creates the typed name and selects the new option', async () => {
    const onCreateOption = jest.fn().mockResolvedValue({ value: '9', label: 'Box' })
    const onValueChange = renderRemote(onCreateOption)
    typeSearch('  Box ')
    fireEvent.press(screen.getByLabelText('components.dropdownCreate'))
    await screen.findByDisplayValue('Box')
    expect(onCreateOption).toHaveBeenCalledWith('Box')
    expect(onValueChange).toHaveBeenCalledWith('9')
  })

  it('does not select anything when creation fails', async () => {
    const onCreateOption = jest.fn().mockResolvedValue(null)
    const onValueChange = renderRemote(onCreateOption)
    typeSearch('Box')
    fireEvent.press(screen.getByLabelText('components.dropdownCreate'))
    await act(async () => {
      await Promise.resolve()
    })
    expect(onCreateOption).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('hides the create row when the name matches an option (case-insensitive)', () => {
    renderRemote(jest.fn())
    typeSearch('retail')
    expect(createRow()).toBeNull()
  })

  it('hides the create row when the name matches a selected option not on the page', () => {
    renderRemote(jest.fn(), { selectedOptions: [{ value: '42', label: 'Far page' }] })
    typeSearch('far PAGE')
    expect(createRow()).toBeNull()
  })

  it('waits for the search to settle before offering the create row', () => {
    renderRemote(jest.fn())
    typeSearch('Box', { settle: false })
    expect(createRow()).toBeNull()
    act(() => {
      jest.advanceTimersByTime(DROPDOWN_SEARCH_DEBOUNCE_MS)
    })
    expect(createRow()).not.toBeNull()
  })

  it('hides the create row while the list is fetching', () => {
    renderRemote(jest.fn(), { fetching: true })
    typeSearch('Box')
    expect(createRow()).toBeNull()
  })

  it('hides the create row until the list was requested for the typed text', () => {
    renderRemote(jest.fn(), { searchedQuery: '' })
    typeSearch('Box')
    expect(createRow()).toBeNull()
  })

  it('offers the create row once the list belongs to the typed text', () => {
    renderRemote(jest.fn(), { searchedQuery: 'Box' })
    typeSearch('Box')
    expect(createRow()).not.toBeNull()
  })

  it('ignores a second tap while the first create is still pending', async () => {
    let resolve: (option: DropdownOption) => void = () => {}
    const onCreateOption = jest.fn(() => new Promise<DropdownOption>((done) => (resolve = done)))
    renderRemote(onCreateOption)
    typeSearch('Box')
    const row = screen.getByLabelText('components.dropdownCreate')
    fireEvent.press(row)
    fireEvent.press(row)
    expect(onCreateOption).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolve({ value: '9', label: 'Box' })
    })
  })

  it('hides the create row without onCreateOption', () => {
    renderRemote(undefined)
    typeSearch('Box')
    expect(createRow()).toBeNull()
  })
})
