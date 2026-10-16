import React, { useCallback, useState } from 'react'
import { View } from 'react-native'
import { router, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import { MyChat, MockChatAdapter } from '@/components/ui/chat'
import type { ChatPendingPrompt, ChatSuggestionInput, MessageAction } from '@/components/ui/chat'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

const SUGGESTIONS: ChatSuggestionInput[] = [
  { id: 'create-product', label: 'Tạo sản phẩm mới' },
  { id: 'check-stock', label: 'Kiểm tra tồn kho' },
  { id: 'todays-orders', label: 'Xem đơn hàng hôm nay' },
]

export default function ChatPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [pendingPrompt, setPendingPrompt] = useState<ChatPendingPrompt>()
  const [focusComposerToken, setFocusComposerToken] = useState<number>()

  const handleSendPending = useCallback(() => {
    setPendingPrompt({ id: String(Date.now()), text: t('playground.chatPendingPrompt') })
  }, [t])

  const handleFocusComposer = useCallback(() => {
    setFocusComposerToken((current) => (current ?? 0) + 1)
  }, [])

  const handleAction = useCallback(
    (action: MessageAction) => {
      if (action.type === 'navigate') {
        router.push(action.href as Href)
        return
      }
      if (action.type === 'custom') {
        Toast.show({ text: t('playground.chatCustomActionToast'), type: 'info' })
      }
    },
    [t],
  )

  return (
    <View style={styles.chatScreen}>
      <View style={styles.chatEntryToolbar}>
        <MyButton
          type="light"
          size="small"
          text={t('playground.chatSendPending')}
          onPress={handleSendPending}
        />
        <MyButton
          type="light"
          size="small"
          text={t('playground.chatFocusComposer')}
          onPress={handleFocusComposer}
        />
      </View>
      <MyChat
        adapter={MockChatAdapter}
        onAction={handleAction}
        emptyStateTitle={t('playground.chatEmptyTitle')}
        emptyStateSubtitle={t('playground.chatEmptySubtitle')}
        suggestions={SUGGESTIONS}
        pendingPrompt={pendingPrompt}
        focusComposerToken={focusComposerToken}
      />
    </View>
  )
}
