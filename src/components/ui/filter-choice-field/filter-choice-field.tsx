import { memo, useCallback } from 'react'

import MyCheckbox from '@/components/elements/my-checkbox'
import MyDropdownInput from '@/components/elements/my-dropdown-input'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'
import { singleDropdownValue } from '@/utils/list-filter'

import { generateStyles } from './styles'
import type { FilterChoiceFieldProps, FilterChoiceOption } from './type'
import { shouldUseFilterDropdown, toggledFilterIds } from './utils'

type FilterChoiceOptionRowProps = {
  id: string
  label: string
  checked: boolean
  onToggle: (id: string) => void
}

const FilterChoiceOptionRow = memo(function FilterChoiceOptionRow({
  id,
  label,
  checked,
  onToggle,
}: FilterChoiceOptionRowProps) {
  const handleChange = useCallback(() => {
    onToggle(id)
  }, [id, onToggle])

  return (
    <MyCheckbox label={label} checked={checked} onValueChange={handleChange} isLeftLabel={false} />
  )
})

function FilterChoiceField({
  title,
  options,
  selectedIds,
  multiple = false,
  placeholder,
  onToggle,
}: FilterChoiceFieldProps) {
  const styles = useThemedStyles(generateStyles)
  const useDropdown = shouldUseFilterDropdown(options.length)

  const handleDropdownChange = useCallback(
    (value: string | string[]) => {
      if (multiple) {
        const next = Array.isArray(value) ? value : []
        for (const id of toggledFilterIds(selectedIds, next)) {
          onToggle(id)
        }
        return
      }
      const next = singleDropdownValue(value)
      const current = selectedIds[0] ?? null
      if (next === current) {
        return
      }
      if (!next) {
        if (current) {
          onToggle(current)
        }
        return
      }
      onToggle(next)
    },
    [multiple, onToggle, selectedIds],
  )

  const renderOption = useCallback(
    (option: FilterChoiceOption) => (
      <FilterChoiceOptionRow
        key={`filter-choice-${option.value}`}
        id={option.value}
        label={option.label}
        checked={selectedIds.includes(option.value)}
        onToggle={onToggle}
      />
    ),
    [onToggle, selectedIds],
  )

  return (
    <MyView style={styles.section}>
      <MyText typography="caption" style={styles.title}>
        {title}
      </MyText>
      <ConditionRenderer
        when={useDropdown}
        fallback={<MyView style={styles.optionList}>{options.map(renderOption)}</MyView>}
      >
        <MyDropdownInput
          options={options}
          value={multiple ? selectedIds : (selectedIds[0] ?? null)}
          onValueChange={handleDropdownChange}
          placeholder={placeholder}
          multiSelect={multiple}
          allowClear
        />
      </ConditionRenderer>
    </MyView>
  )
}

export default memo(FilterChoiceField)
