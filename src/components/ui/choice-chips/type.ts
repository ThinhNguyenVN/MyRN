/** One pill of a single-choice group. */
export type ChoiceOption = { value: string; label: string }

export type ChoiceChipsProps = {
  options: ChoiceOption[]
  value: string | null
  disabled?: boolean
  onChange: (value: string) => void
}
