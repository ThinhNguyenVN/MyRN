import React, { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import type { DropdownOption } from '@/components/elements/my-dropdown-input'
import MyDropdownInput from '@/components/elements/my-dropdown-input'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyTextInput from '@/components/elements/my-text-input'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ChatFormField, ChatFormValues, FormMessage } from './types'

interface ChatFormFieldInputProps {
  field: ChatFormField
  value: string
  onChange: (name: string, value: string) => void
}

function ChatFormFieldInput({ field, value, onChange }: ChatFormFieldInputProps) {
  const handleChangeText = useCallback(
    (text: string) => onChange(field.name, text),
    [field.name, onChange],
  )
  const handleValueChange = useCallback(
    (next: string | string[]) => onChange(field.name, Array.isArray(next) ? (next[0] ?? '') : next),
    [field.name, onChange],
  )

  if (field.type === 'select') {
    const options: DropdownOption[] = (field.options ?? []).map((option) => ({
      label: option.label,
      value: option.id,
    }))
    return (
      <MyDropdownInput
        title={field.label}
        options={options}
        value={value || null}
        onValueChange={handleValueChange}
        required={field.required}
      />
    )
  }

  return (
    <MyTextInput
      title={field.label}
      value={value}
      onChangeText={handleChangeText}
      keyboardType={field.type === 'number' ? 'numeric' : 'default'}
      required={field.required}
    />
  )
}

export interface MyChatFormMessageProps {
  message: FormMessage
  onSubmitForm: (messageId: string, values: ChatFormValues) => void
}

function MyChatFormMessage({ message, onSubmitForm }: MyChatFormMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const isSubmitted = message.submittedValues !== undefined

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(message.fields.map((field) => [field.name, ''])),
  )

  const handleFieldChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const canSubmit = useMemo(
    () =>
      message.fields.every(
        (field) => !field.required || (values[field.name]?.trim().length ?? 0) > 0,
      ),
    [message.fields, values],
  )

  const handleSubmit = useCallback(() => {
    const parsed: ChatFormValues = {}
    for (const field of message.fields) {
      const raw = values[field.name] ?? ''
      parsed[field.name] = field.type === 'number' ? Number(raw) : raw
    }
    onSubmitForm(message.id, parsed)
  }, [message.fields, message.id, onSubmitForm, values])

  if (isSubmitted) {
    return (
      <MySurface radius="large" style={styles.interactiveCard}>
        <ConditionRenderer when={Boolean(message.title)}>
          <MyText typography="label">{message.title}</MyText>
        </ConditionRenderer>
        <MyView style={styles.submittedValuesList}>
          {message.fields.map((field) => (
            <MyView key={`chat-form-submitted-${field.name}`} style={styles.summaryRow}>
              <MyText typography="caption" color="text/active/secondary">
                {field.label}
              </MyText>
              <MyText typography="label">
                {String(message.submittedValues?.[field.name] ?? '')}
              </MyText>
            </MyView>
          ))}
        </MyView>
      </MySurface>
    )
  }

  return (
    <MySurface radius="large" style={styles.interactiveCard}>
      <ConditionRenderer when={Boolean(message.title)}>
        <MyText typography="label">{message.title}</MyText>
      </ConditionRenderer>
      <MyView style={styles.formFieldsGap}>
        {message.fields.map((field) => (
          <ChatFormFieldInput
            key={`chat-form-field-${field.name}`}
            field={field}
            value={values[field.name] ?? ''}
            onChange={handleFieldChange}
          />
        ))}
      </MyView>
      <MyButton
        text={message.submitLabel ?? t('components.chat.formSubmit')}
        type="primary"
        width="full"
        elevation="none"
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </MySurface>
  )
}

export default memo(MyChatFormMessage)
