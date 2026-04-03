import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { Modal, View } from 'react-native'

import MyAlert from '@/components/elements/my-alert'

import type { ConfirmationOptions, ConfirmationRef } from './type'

import { generateStyles } from './styles'
import { useThemedStyles } from '@/theme/theme-context'

type Resolver = (value: boolean) => void

const ConfirmationRoot = forwardRef<ConfirmationRef, object>(function ConfirmationRoot(_, ref) {
  const styles = useThemedStyles(generateStyles)
  const [visible, setVisible] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)
  const resolverRef = useRef<Resolver | null>(null)

  const resolveOnce = useCallback((value: boolean) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    if (resolve) {
      resolve(value)
    }
  }, [])

  const hide = useCallback(() => {
    setVisible(false)
    resolveOnce(false)
  }, [resolveOnce])

  const show = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
    if (resolverRef.current) {
      return Promise.reject(
        new Error('[Confirmation] Cannot open while another confirmation is active'),
      )
    }
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setOptions(opts)
      setVisible(true)
    })
  }, [])

  useImperativeHandle(ref, () => ({ show, hide }), [show, hide])

  const handleConfirm = useCallback(() => {
    setVisible(false)
    resolveOnce(true)
  }, [resolveOnce])

  const handleCancel = useCallback(() => {
    setVisible(false)
    resolveOnce(false)
  }, [resolveOnce])

  const handleClose = useCallback(() => {
    setVisible(false)
    resolveOnce(false)
  }, [resolveOnce])

  if (!options) return null

  const { confirmText, cancelText, buttons: customButtons, hideClose, ...alertProps } = options

  const buttons = customButtons ?? [
    ...(confirmText
      ? [{ text: confirmText, type: 'primary' as const, onPress: handleConfirm }]
      : []),
    ...(cancelText ? [{ text: cancelText, type: 'tertiary' as const, onPress: handleCancel }] : []),
  ]

  return (
    <Modal
      visible={visible}
      transparent
      animationType={'fade'}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <MyAlert
          {...alertProps}
          buttons={buttons}
          onClose={hideClose ? undefined : handleClose}
          style={styles.centered}
        />
      </View>
    </Modal>
  )
})

export default ConfirmationRoot
