import { useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import DrawerMenu, { type DrawerMenuItem, type DrawerMenuSide } from '@/components/ui/drawer-menu'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function DrawerMenuPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [side, setSide] = useState<DrawerMenuSide>('left')

  const data = useMemo<DrawerMenuItem[]>(
    () => [
      { id: 'home', label: t('playground.drawerItemHome'), icon: 'home-outline' },
      { id: 'profile', label: t('playground.drawerItemProfile'), icon: 'person-outline' },
      { id: 'settings', label: t('playground.drawerItemSettings'), icon: 'settings-outline' },
    ],
    [t],
  )

  const open = (next: DrawerMenuSide) => {
    setSide(next)
    setVisible(true)
  }

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="body" style={styles.sectionTitle}>
        {t('playground.drawerIntro')}
      </MyText>

      <MyView style={styles.bottomsheet}>
        <MyButton
          width="full"
          text={t('playground.drawerOpenLeft')}
          size="small"
          type="primary"
          onPress={() => open('left')}
        />
        <MyButton
          width="full"
          text={t('playground.drawerOpenRight')}
          size="small"
          type="primary"
          onPress={() => open('right')}
        />
      </MyView>

      <DrawerMenu
        visible={visible}
        onClose={() => setVisible(false)}
        side={side}
        title={t('playground.drawerTitle')}
        subtitle={t('playground.drawerSubtitle')}
        meta={t('playground.drawerMeta')}
        data={data}
        closeAccessibilityLabel={t('common.close')}
        onSelected={(item) => {
          setVisible(false)
          Toast.show({ text: t('playground.drawerSelected', { label: item.label }), type: 'info' })
        }}
      />
    </ScrollView>
  )
}
