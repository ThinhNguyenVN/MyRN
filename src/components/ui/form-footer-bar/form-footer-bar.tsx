import { memo, useCallback, useMemo, useRef } from 'react'
import { InteractionManager, type StyleProp, type ViewStyle } from 'react-native'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { FormFooterAmountBar } from '@/components/ui/form-footer-amount-bar'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { FormFooterBarProps, FormFooterExtraAction } from './type'

type FooterActionButtonProps = {
  action: FormFooterExtraAction
  busy: boolean
  width: 'auto' | 'full'
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

const FooterActionButton = memo(function FooterActionButton({
  action,
  busy,
  width,
  style,
  onPress,
}: FooterActionButtonProps) {
  return (
    <MyButton
      text={action.label}
      type={action.type}
      size="small"
      width={width}
      elevation="none"
      onPress={onPress ?? action.onPress}
      disabled={busy}
      style={style}
    />
  )
})

type SheetFooterActionButtonProps = {
  action: FormFooterExtraAction
  busy: boolean
  onCloseThenRun: (action: () => void) => void
}

const SheetFooterActionButton = memo(function SheetFooterActionButton({
  action,
  busy,
  onCloseThenRun,
}: SheetFooterActionButtonProps) {
  const handlePress = useCallback(() => {
    onCloseThenRun(action.onPress)
  }, [action.onPress, onCloseThenRun])

  return <FooterActionButton action={action} busy={busy} width="full" onPress={handlePress} />
})

function FormFooterBarComponent({
  canSave,
  busy,
  saveLabel,
  onSave,
  extraActions,
  showAmount,
  totalLabel,
  totalText,
  leading,
  moreTitle,
  moreAccessibilityLabel,
  backLabel,
  showBack = false,
  onBack,
  nextLabel,
  onNext,
  isLastStep = true,
}: FormFooterBarProps) {
  const styles = useThemedStyles(generateStyles)
  const isMobileSize = useIsMobileSize()
  const moreSheetRef = useRef<MyBottomSheetRef>(null)
  const pendingSheetActionRef = useRef<(() => void) | null>(null)
  const visibleExtras = useMemo(
    () => extraActions.filter((action) => action.visible),
    [extraActions],
  )
  const pinExtraToFooter = !canSave && visibleExtras.length === 1
  const showMoreMenu = isMobileSize && visibleExtras.length > 0 && !pinExtraToFooter
  const pinnedExtra = pinExtraToFooter ? visibleExtras[0] : null
  const moreIcon = useMemo(
    () => <MyIcon name="ellipsis-horizontal" size={18} color="icon/active/primary" />,
    [],
  )
  const showBackButton = Boolean(showBack && onBack && backLabel)

  const handleOpenMore = useCallback(() => {
    pendingSheetActionRef.current = null
    moreSheetRef.current?.open()
  }, [])

  const handleSheetClosed = useCallback(() => {
    const action = pendingSheetActionRef.current
    pendingSheetActionRef.current = null
    if (!action) {
      return
    }
    void InteractionManager.runAfterInteractions(action)
  }, [])

  const runAfterSheetClose = useCallback((action: () => void) => {
    pendingSheetActionRef.current = action
    moreSheetRef.current?.close()
  }, [])

  const amountBar = showAmount ? (
    <FormFooterAmountBar
      totalLabel={totalLabel}
      totalText={totalText}
      layout={onNext ? 'stacked' : 'compact'}
      leading={leading}
    />
  ) : null

  if (onNext) {
    return (
      <MyView style={[styles.shell, styles.shellWizard]} fillParent={false}>
        <MyView style={styles.wizardStack} fillParent={false}>
          {amountBar}
          <MyView style={styles.wizardActions} fillParent={false}>
            <ConditionRenderer when={showBackButton} fallback={null}>
              <MyView style={styles.wizardButtonGrow} fillParent={false}>
                <MyButton
                  text={backLabel}
                  type="secondary"
                  size="large"
                  width="full"
                  elevation="none"
                  onPress={onBack}
                  disabled={busy}
                />
              </MyView>
            </ConditionRenderer>
            <MyView style={styles.wizardButtonGrow} fillParent={false}>
              <MyButton
                text={isLastStep ? saveLabel : nextLabel}
                type="primary"
                size="large"
                width="full"
                elevation="none"
                onPress={isLastStep ? onSave : onNext}
                loading={isLastStep ? busy : false}
                disabled={busy}
              />
            </MyView>
          </MyView>
        </MyView>
      </MyView>
    )
  }

  const saveButton = canSave ? (
    <MyButton
      text={saveLabel}
      type="primary"
      size="small"
      width="auto"
      elevation="none"
      onPress={onSave}
      loading={busy}
      disabled={busy}
      style={styles.actionButton}
    />
  ) : null

  const backButton = showBackButton ? (
    <MyButton
      text={backLabel}
      type="secondary"
      size="small"
      width="auto"
      elevation="none"
      onPress={onBack}
      disabled={busy}
      style={styles.actionButton}
    />
  ) : null

  const moreButton = (
    <MyButton
      left={moreIcon}
      type="light"
      size="small"
      width="auto"
      elevation="none"
      onPress={handleOpenMore}
      disabled={busy}
      accessibilityLabel={moreAccessibilityLabel}
    />
  )

  const desktopExtras = visibleExtras.map((action) => (
    <FooterActionButton
      key={`footer-action-${action.id}`}
      action={action}
      busy={busy}
      width="auto"
      style={styles.actionButton}
    />
  ))

  const sheetExtras = visibleExtras.map((action) => (
    <SheetFooterActionButton
      key={`footer-sheet-${action.id}`}
      action={action}
      busy={busy}
      onCloseThenRun={runAfterSheetClose}
    />
  ))

  const mobileActions = (
    <>
      {backButton}
      {canSave ? saveButton : null}
      <ConditionRenderer when={Boolean(pinnedExtra)}>
        {pinnedExtra ? (
          <FooterActionButton
            action={pinnedExtra}
            busy={busy}
            width="auto"
            style={styles.actionButton}
          />
        ) : null}
      </ConditionRenderer>
      <ConditionRenderer when={showMoreMenu}>{moreButton}</ConditionRenderer>
    </>
  )

  const desktopActions = (
    <>
      {backButton}
      {desktopExtras}
      {saveButton}
    </>
  )

  return (
    <MyView style={styles.shell} fillParent={false}>
      <MyView style={styles.row} fillParent={false}>
        <MyView style={styles.actions} fillParent={false}>
          {isMobileSize ? mobileActions : desktopActions}
        </MyView>
        <ConditionRenderer when={showAmount}>{amountBar}</ConditionRenderer>
      </MyView>
      <ConditionRenderer when={showMoreMenu}>
        <MyBottomSheet
          ref={moreSheetRef}
          title={moreTitle}
          pressBackdropToClose
          onClosed={handleSheetClosed}
          contentContainerStyle={styles.sheetBody}
        >
          {sheetExtras}
        </MyBottomSheet>
      </ConditionRenderer>
    </MyView>
  )
}

export const FormFooterBar = memo(FormFooterBarComponent)
