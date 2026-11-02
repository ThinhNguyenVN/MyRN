export type FilterChoiceOption = {
  label: string
  value: string
}

export type FilterChoiceFieldProps = {
  title: string
  options: FilterChoiceOption[]
  /** Selected ids. Single-select uses an empty list or one id. */
  selectedIds: string[]
  /** Multi-select keeps every chosen id. Single-select replaces the current id. */
  multiple?: boolean
  placeholder?: string
  /**
   * Toggle one id. Callers must apply it with a functional state update so several
   * calls in one event (dropdown clear) chain correctly.
   */
  onToggle: (id: string) => void
}
