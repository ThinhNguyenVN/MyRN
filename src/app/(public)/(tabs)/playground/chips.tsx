import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import MyChip, { MyChips } from '@/components/elements/my-chip'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function ChipsScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [selectedFilter, setSelectedFilter] = useState<string | null>('all')
  const [removableItems, setRemovableItems] = useState(['Tag 1', 'Tag 2', 'Tag 3'])
  const [chipsData, setChipsData] = useState(['React', 'Native', 'Expo'])
  const [chipsSelected, setChipsSelected] = useState<string[]>(['React'])

  return (
    <MyKeyboardAvoiding.ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.chipsTypes')}
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip label={t('playground.chipsPrimary')} type="primary" onPress={() => {}} />
        <MyChip label={t('playground.chipsSecondary')} type="secondary" onPress={() => {}} />
        <MyChip label={t('playground.chipsOutlined')} type="outlined" onPress={() => {}} />
        <MyChip label={t('playground.chipsFilled')} type="filled" onPress={() => {}} />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.chipsSizes')}
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip label={t('playground.chipsSmall')} type="filled" size="small" onPress={() => {}} />
        <MyChip
          label={t('playground.chipsMedium')}
          type="filled"
          size="medium"
          onPress={() => {}}
        />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.chipsWithIcons')}
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip
          label={t('playground.chipsLeftIcon')}
          type="primary"
          left={<MyIcon name="heart" size={16} color="#ffffff" />}
          onPress={() => {}}
        />
        <MyChip
          label={t('playground.chipsRightIcon')}
          type="secondary"
          right={<MyIcon name="chevron-forward" size={16} color="icon/active/primary" />}
          onPress={() => {}}
        />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.chipsFilter')}
      </MyText>
      <MyView style={styles.chipRow}>
        {(['all', 'active', 'done'] as const).map((key) => (
          <MyChip
            key={key}
            label={
              key === 'all'
                ? t('playground.chipsAll')
                : key === 'active'
                  ? t('playground.chipsActive')
                  : t('playground.chipsDone')
            }
            type={'primary'}
            selected={selectedFilter === key}
            onPress={() => setSelectedFilter(key)}
          />
        ))}
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('common.disabled')}
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip label={t('playground.chipsDisabled')} type="primary" disabled onPress={() => {}} />
        <MyChip label={t('playground.chipsDisabledOutlined')} type="outlined" disabled />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.chipsInputRemovable')}
      </MyText>
      <MyView style={styles.chipRow}>
        {removableItems.map((label) => (
          <MyChip
            key={label}
            label={label}
            type={'secondary'}
            showClose
            onClose={() => setRemovableItems((prev) => prev.filter((x) => x !== label))}
          />
        ))}
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.chipsDisplayOnly')}
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip label={t('playground.chipsTag')} type="filled" />
        <MyChip label={t('playground.chipsLabel')} type="outlined" />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        {t('playground.chipsMyChips')}
      </MyText>
      <MyChips
        data={chipsData}
        multiSelect
        selected={chipsSelected}
        onChanged={setChipsSelected}
        canRemove
        canAdd
        onRemove={(label) => {
          setChipsData((prev) => prev.filter((x) => x !== label))
          setChipsSelected((prev) => prev.filter((x) => x !== label))
        }}
        onAdd={(label) => setChipsData((prev) => [...prev, label])}
        chipProps={{ type: 'primary' }}
        style={styles.chipRow}
      />
    </MyKeyboardAvoiding.ScrollView>
  )
}
