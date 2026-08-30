import { useCallback, useState } from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyKeyboardAvoiding } from '@/components/ui/my-keyboard-avoiding'
import MyTabSwitcher from '@/components/ui/my-tab-switcher'
import type { MyTabItem } from '@/components/ui/my-tab-switcher'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

type TabId = 'stats' | 'list'

const TABS: MyTabItem<TabId>[] = [
  { id: 'stats', label: 'Thống kê' },
  { id: 'list', label: 'Danh sách' },
]

export default function MyTabSwitcherScreen() {
  const styles = useThemedStyles(generateStyles)
  const [activeId, setActiveId] = useState<TabId>('stats')

  const handleChange = useCallback((id: TabId) => setActiveId(id), [])

  const renderContent = useCallback(
    (id: TabId) => (
      <MyView style={styles.chipRow}>
        <MyText typography="body">
          {id === 'stats' ? 'Nội dung tab Thống kê' : 'Nội dung tab Danh sách'}
        </MyText>
      </MyView>
    ),
    [styles.chipRow],
  )

  return (
    <MyKeyboardAvoiding.ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.sectionTitle}>
        MyTabSwitcher
      </MyText>
      <MyTabSwitcher
        tabs={TABS}
        activeId={activeId}
        onChange={handleChange}
        renderContent={renderContent}
      />
    </MyKeyboardAvoiding.ScrollView>
  )
}
