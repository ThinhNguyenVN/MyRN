import React, { memo, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import Markdown from 'react-native-markdown-display'

import { FontFamily } from '@/theme/fonts'
import { type ThemeType, useThemedStyles } from '@/theme/theme-context'
import { Typography } from '@/theme/typography'

export interface MyChatMarkdownProps {
  text: string
}

/**
 * The assistant's words as basic markdown (bold, lists, line breaks, inline code), in the chat's
 * body typography. Gateway replies use these; nothing else (images, tables) is styled on purpose.
 */
const generateMarkdownStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme
  const text = { ...Typography.body, color: getColor('text/active/primary') }
  return StyleSheet.create({
    body: text,
    paragraph: { marginTop: 0, marginBottom: getSpacing('x2') },
    strong: { fontFamily: FontFamily.bold, fontWeight: 'normal' },
    em: { fontStyle: 'italic' },
    bullet_list: { marginBottom: getSpacing('x1') },
    ordered_list: { marginBottom: getSpacing('x1') },
    list_item: { marginBottom: getSpacing('x1') },
    code_inline: {
      fontFamily: FontFamily.medium,
      backgroundColor: getColor('fill/background/secondary'),
      borderWidth: 0,
      paddingHorizontal: getSpacing('x1'),
    },
    heading1: { ...Typography.subtitle, color: text.color },
    heading2: { ...Typography.subtitle, color: text.color },
    heading3: { ...Typography.subtitle, color: text.color },
  })
}

function MyChatMarkdown({ text }: MyChatMarkdownProps) {
  const styles = useThemedStyles(generateMarkdownStyles)
  // A reply that ends mid-stream with an open "**" still renders as text, never throws.
  const content = useMemo(() => text.trimEnd(), [text])
  return <Markdown style={styles}>{content}</Markdown>
}

export default memo(MyChatMarkdown)
