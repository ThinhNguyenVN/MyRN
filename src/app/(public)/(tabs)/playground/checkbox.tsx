import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyCheckbox from '@/components/elements/my-checkbox'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function CheckboxScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [cb1, setCb1] = useState(false)
  const [cb2, setCb2] = useState(true)
  const [radioOption, setRadioOption] = useState<string>('a')

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.checkboxBasic')}
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          label={t('playground.checkboxUnchecked')}
        />
        <MyCheckbox
          type="checkbox"
          checked={cb2}
          onValueChange={setCb2}
          label={t('playground.checkboxChecked')}
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.checkboxDisabled')}
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="checkbox"
          checked={false}
          onValueChange={() => {}}
          disabled
          label={t('playground.checkboxDisabledUnchecked')}
        />
        <MyCheckbox
          type="checkbox"
          checked={true}
          onValueChange={() => {}}
          disabled
          label={t('playground.checkboxDisabledChecked')}
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.checkboxLabelPosition')}
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          isLeftLabel={true}
          label={t('playground.checkboxLeftLabel')}
        />
        <MyCheckbox
          type="checkbox"
          checked={cb2}
          onValueChange={setCb2}
          isLeftLabel={false}
          label={t('playground.checkboxRightLabel')}
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.checkboxLabelStyle')}
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="checkbox"
          checked={cb1}
          onValueChange={setCb1}
          label={t('playground.checkboxLabelFlex')}
        />
        <MyCheckbox
          type="checkbox"
          checked={cb2}
          onValueChange={setCb2}
          isLeftLabel={false}
          label={t('playground.checkboxLabelRightAlign')}
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.checkboxNoLabel')}
      </MyText>
      <MyView style={styles.inputContainer} flexDirection="row" gap={16}>
        <MyCheckbox type="checkbox" checked={cb1} onValueChange={setCb1} />
        <MyCheckbox type="checkbox" checked={cb2} onValueChange={setCb2} />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.radioBasic')}
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          label={t('playground.dropdownOptionA')}
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'b'}
          onValueChange={(v) => v && setRadioOption('b')}
          label={t('playground.dropdownOptionB')}
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'c'}
          onValueChange={(v) => v && setRadioOption('c')}
          label={t('playground.dropdownOptionC')}
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.radioLabelPosition')}
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          isLeftLabel={false}
          label={t('playground.radioRightLabel')}
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.radioDisabled')}
      </MyText>
      <MyView style={styles.inputContainer}>
        <MyCheckbox
          type="radio"
          checked={true}
          onValueChange={() => {}}
          disabled
          label={t('playground.radioDisabledChecked')}
        />
        <MyCheckbox
          type="radio"
          checked={false}
          onValueChange={() => {}}
          disabled
          label={t('playground.radioDisabledUnchecked')}
        />
      </MyView>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.radioElevation')}
      </MyText>
      <View style={styles.inputContainer}>
        <MyCheckbox
          type="radio"
          checked={radioOption === 'a'}
          onValueChange={(v) => v && setRadioOption('a')}
          elevation="none"
          label={t('playground.radioElevationNone')}
        />
        <MyCheckbox
          type="radio"
          checked={radioOption === 'b'}
          onValueChange={(v) => v && setRadioOption('b')}
          elevation="soft/down/small"
          label={t('playground.radioElevationDefault')}
        />
      </View>

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.radioNoLabel')}
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
