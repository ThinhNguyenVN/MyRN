import { useState } from 'react'
import { ScrollView } from 'react-native'

import MyChip, { MyChips } from '@/components/elements/my-chip'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function ChipsScreen() {
  const styles = useThemedStyles(generateStyles)
  const [selectedFilter, setSelectedFilter] = useState<string | null>('all')
  const [removableItems, setRemovableItems] = useState(['Tag 1', 'Tag 2', 'Tag 3'])
  const [chipsData, setChipsData] = useState(['React', 'Native', 'Expo'])
  const [chipsSelected, setChipsSelected] = useState<string[]>(['React'])

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        Chips
      </MyText>

      <MyText typography="body" color="text/active/secondary" style={styles.sectionCaption}>
        Types: primary, secondary, outlined, filled. Sizes: small, medium. Selected state and
        showClose (input chip).
      </MyText>

      <MyText typography="label" style={styles.sectionTitle}>
        Types
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip label="Primary" type="primary" onPress={() => {}} />
        <MyChip label="Secondary" type="secondary" onPress={() => {}} />
        <MyChip label="Outlined" type="outlined" onPress={() => {}} />
        <MyChip label="Filled" type="filled" onPress={() => {}} />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        Sizes
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip label="Small" type="filled" size="small" onPress={() => {}} />
        <MyChip label="Medium" type="filled" size="medium" onPress={() => {}} />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        With icons
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip
          label="Left icon"
          type="primary"
          left={<MyIcon name="heart" size={16} color="#ffffff" />}
          onPress={() => {}}
        />
        <MyChip
          label="Right icon"
          type="secondary"
          right={<MyIcon name="chevron-forward" size={16} color="icon/active/primary" />}
          onPress={() => {}}
        />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        Filter (selected state)
      </MyText>
      <MyView style={styles.chipRow}>
        {(['all', 'active', 'done'] as const).map((key) => (
          <MyChip
            key={key}
            label={key === 'all' ? 'All' : key === 'active' ? 'Active' : 'Done'}
            type={'primary'}
            selected={selectedFilter === key}
            onPress={() => setSelectedFilter(key)}
          />
        ))}
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        Disabled
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip label="Disabled" type="primary" disabled onPress={() => {}} />
        <MyChip label="Disabled outlined" type="outlined" disabled />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        Input chips (removable)
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
        Display only (no onPress)
      </MyText>
      <MyView style={styles.chipRow}>
        <MyChip label="Tag" type="filled" />
        <MyChip label="Label" type="outlined" />
      </MyView>

      <MyText typography="label" style={styles.sectionTitle}>
        MyChips (multiSelect, canRemove, canAdd)
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
    </ScrollView>
  )
}
