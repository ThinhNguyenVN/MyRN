import { useState } from 'react'
import { ScrollView, View } from 'react-native'

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
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          label="Unchecked (default elevation)"
        />
        <MyCheckbox type="checkbox" checked={cb2} onValueChange={setCb2} label="Checked" />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Checkbox — Disabled
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="checkbox"
          checked={false}
          onValueChange={() => {}}
          disabled
          label="Disabled unchecked"
        />
        <MyCheckbox
          type="checkbox"
          checked={true}
          onValueChange={() => {}}
          disabled
          label="Disabled checked"
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Checkbox — Label position
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          isLeftLabel={true}
          label="isLeftLabel={true} (label trái)"
        />
        <MyCheckbox
          type="checkbox"
          checked={cb2}
          onValueChange={setCb2}
          isLeftLabel={false}
          label="isLeftLabel={false} (label phải)"
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Checkbox — labelStyle
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          label="Label với flex: 1"
        />
        <MyCheckbox
          type="checkbox"
          checked={cb2}
          onValueChange={setCb2}
          isLeftLabel={false}
          label="Label phải, textAlign: right"
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Checkbox — No label
      </MyText>
      <MyView style={styles.inputContainer} flexDirection="row" gap={16}>
        <MyCheckbox type="checkbox" checked={cb1} onValueChange={setCb1} />
        <MyCheckbox type="checkbox" checked={cb2} onValueChange={setCb2} />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — Basic
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          label="Option A"
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'b'}
          onValueChange={(v) => v && setRadioOption('b')}
          label="Option B"
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'c'}
          onValueChange={(v) => v && setRadioOption('c')}
          label="Option C"
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — Label position
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          isLeftLabel={false}
          label="Radio label bên phải"
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — Disabled
      </MyText>
      <MyView style={styles.inputContainer}>
        <MyCheckbox
          type="radio"
          checked={true}
          onValueChange={() => {}}
          disabled
          label="Radio disabled (checked)"
        />
        <MyCheckbox
          type="radio"
          checked={false}
          onValueChange={() => {}}
          disabled
          label="Radio disabled (unchecked)"
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — Elevation
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          elevation="none"
          label={'Radio elevation="none"'}
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'b'}
          onValueChange={(v) => v && setRadioOption('b')}
          elevation="soft/down/small"
          label="Radio elevation default"
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        Radio — No label
      </MyText>
      <MyView style={styles.inputContainer} flexDirection="row" gap={16}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'b'}
          onValueChange={(v) => v && setRadioOption('b')}
        />
      </MyView>
    </ScrollView>
  )
}
