import { isNil } from 'lodash'
import { useState } from 'react'
import { FlatList, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import {
  MyWheelPicker,
  WheelPickerView,
  type WheelPickerItem,
} from '@/components/elements/my-wheel-picker'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

const SCREEN_KEY = 'wheel-picker-screen'

const SAMPLE_ITEMS: WheelPickerItem[] = Array.from({ length: 7 }, (_, i) => ({
  label: `Option ${i + 1}`,
  value: i + 1,
}))

export default function WheelPickerScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [selectedIndex, setSelectedIndex] = useState(1)
  const [value, setValue] = useState<number | null>(null)

  const renderContent = () => (
    <View style={styles.screenContent}>
      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.wheelSample1')}
      </MyText>
      <MyView style={styles.inputContainer}>
        <WheelPickerView
          items={SAMPLE_ITEMS}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
        />
        <MyText typography="body" style={styles.labelMargin}>
          {t('playground.wheelSelected')}: {SAMPLE_ITEMS[selectedIndex]?.label ?? '—'}
        </MyText>
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.wheelSample2')}
      </MyText>
      <MyView style={styles.inputContainer}>
        <MyWheelPicker
          items={SAMPLE_ITEMS}
          value={value}
          onValueChange={setValue}
          title={t('components.wheelSelect')}
          placeholder={t('components.wheelSelect')}
        />
        <MyText typography="body" style={styles.labelMargin}>
          {t('playground.wheelValue')}:{' '}
          {!isNil(value) ? (SAMPLE_ITEMS.find((i) => i.value === value)?.label ?? value) : '—'}
        </MyText>
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('common.disabled')}
      </MyText>
      <MyView style={styles.inputContainer}>
        <MyWheelPicker
          items={SAMPLE_ITEMS}
          value={2}
          onValueChange={() => {}}
          title={t('components.wheelSelect')}
          placeholder={t('components.wheelSelect')}
          disabled
        />
      </MyView>
    </View>
  )

  return (
    <FlatList
      data={[SCREEN_KEY]}
      keyExtractor={(key) => key}
      renderItem={() => renderContent()}
      showsVerticalScrollIndicator={false}
    />
  )
}
