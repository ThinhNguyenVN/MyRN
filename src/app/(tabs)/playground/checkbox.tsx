import { useState } from 'react'
import { ScrollView } from 'react-native'

import MyCheckbox from '@/components/elements/my-checkbox'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function CheckboxScreen() {
  const styles = useThemedStyles(generateStyles)
  const [cb1, setCb1] = useState(false)
  const [cb2, setCb2] = useState(true)
  const [radioOption, setRadioOption] = useState<string>('a')

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Checkbox — Basic
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          label="Unchecked (default elevation)"
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="checkbox"
          checked={cb2}
          onValueChange={setCb2}
          label="Checked"
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Checkbox — Disabled
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MyCheckbox
          type="checkbox"
          checked={false}
          onValueChange={() => {}}
          disabled
          label="Disabled unchecked"
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="checkbox"
          checked={true}
          onValueChange={() => {}}
          disabled
          label="Disabled checked"
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Checkbox — Label position
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          isLeftLabel={true}
          label="isLeftLabel={true} (label trái)"
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="checkbox"
          checked={cb2}
          onValueChange={setCb2}
          isLeftLabel={false}
          label="isLeftLabel={false} (label phải)"
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Checkbox — labelStyle
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          label="Label với flex: 1"
          labelStyle={{ flex: 1 }}
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="checkbox"
          checked={cb2}
          onValueChange={setCb2}
          isLeftLabel={false}
          label="Label phải, textAlign: right"
          labelStyle={{ flex: 1, textAlign: 'right' }}
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Checkbox — No label
      </MyText>
      <MyView style={styles.buttonMargin} flexDirection="row" gap={16}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="checkbox"
          checked={cb2}
          onValueChange={setCb2}
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — Basic
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          label="Option A"
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'b'}
          onValueChange={(v) => v && setRadioOption('b')}
          label="Option B"
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'c'}
          onValueChange={(v) => v && setRadioOption('c')}
          label="Option C"
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — Label position
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          isLeftLabel={false}
          label="Radio label bên phải"
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — Disabled
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MyCheckbox
          type="radio"
          checked={true}
          onValueChange={() => {}}
          disabled
          label="Radio disabled (checked)"
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="radio"
          checked={false}
          onValueChange={() => {}}
          disabled
          label="Radio disabled (unchecked)"
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — Elevation
      </MyText>
      <MyView style={styles.buttonMargin}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          elevation="none"
          label={'Radio elevation="none"'}
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'b'}
          onValueChange={(v) => v && setRadioOption('b')}
          elevation="soft/down/small"
          label="Radio elevation default"
          style={styles.inputContainer}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — No label
      </MyText>
      <MyView style={styles.buttonMargin} flexDirection="row" gap={16}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          style={styles.inputContainer}
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'b'}
          onValueChange={(v) => v && setRadioOption('b')}
          style={styles.inputContainer}
        />
      </MyView>
    </ScrollView>
  )
}
