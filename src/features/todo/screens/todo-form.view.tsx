import React, { memo } from 'react'
import { View } from 'react-native'

import { MyFormSwitch, MyFormTextInput, useFormContext } from '@/components/form'
import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import type { TodoFormInput } from './todo-form.types'
import { generateStyles } from './styles'

type TodoFormViewProps = {
  mode: 'add' | 'edit'
  isSubmitting: boolean
  onSubmit: (values: TodoFormInput) => Promise<void>
}

function TodoFormViewInner({ mode, isSubmitting, onSubmit }: TodoFormViewProps) {
  const styles = useThemedStyles(generateStyles)
  const { handleSubmit } = useFormContext<TodoFormInput>()

  return (
    <View style={styles.contentContainer}>
      <View style={styles.fieldGroup}>
        <MyText typography="subtitle">{mode === 'add' ? 'Create Todo' : 'Edit Todo'}</MyText>

        <MyFormTextInput<TodoFormInput>
          name="todo"
          title="Title"
          required
          placeholder="What needs to be done?"
        />

        <MyFormSwitch<TodoFormInput> name="completed" title="Completed" />
      </View>

      <MyButton
        type="primary"
        text={mode === 'add' ? 'Add Todo' : 'Save Changes'}
        width="full"
        loading={isSubmitting}
        onPress={() => void handleSubmit(onSubmit)()}
        style={styles.submitButton}
      />
    </View>
  )
}

export const TodoFormView = memo(TodoFormViewInner)
