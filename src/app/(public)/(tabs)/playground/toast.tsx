import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import { Confirmation } from '@/components/ui/confirmation'
import { Toast } from '@/components/ui/toast'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function ToastAndConfirmationScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.toastTitle')}
      </MyText>

      <MyButton
        text={t('playground.toastBtnInfo')}
        size="small"
        type="primary"
        onPress={() => Toast.show({ text: t('playground.toastInfoText'), type: 'info' })}
      />
      <MyButton
        text={t('playground.toastBtnSuccess')}
        size="small"
        type="secondary"
        onPress={() => Toast.show({ text: t('playground.toastSuccessText'), type: 'success' })}
      />
      <View style={styles.buttonRow}>
        <MyButton
          text={t('playground.toastBtnWarning')}
          size="small"
          type="tertiary"
          onPress={() =>
            Toast.show({
              text: t('playground.toastWarningText'),
              description: t('playground.toastWarningDescription'),
              type: 'warning',
            })
          }
        />
        <MyButton
          text={t('playground.toastBtnError')}
          size="small"
          type="primary"
          onPress={() =>
            Toast.show({
              text: t('playground.toastErrorText'),
              description: t('playground.toastErrorDescription'),
              type: 'error',
            })
          }
        />
      </View>
      <MyButton
        text={t('playground.toastErrorElevation')}
        size="small"
        type="secondary"
        onPress={() =>
          Toast.show({
            text: t('playground.toastErrorShort'),
            type: 'error',
            elevation: 'soft/down/small',
          })
        }
      />
      <MyButton
        text={t('playground.toastErrorElevation')}
        size="small"
        type="secondary"
        onPress={() =>
          Toast.show({
            text: t('playground.toastErrorShort'),
            type: 'error',
            elevation: 'soft/down/small',
          })
        }
      />
      <MyButton
        text={t('playground.toastInfoNoDesc')}
        size="small"
        type="light"
        onPress={() => Toast.show({ text: t('playground.toastInfoOnlyText'), type: 'info' })}
      />

      <MyText typography="subtitle" style={styles.sectionTitle}>
        {t('playground.confirmationTitle')}
      </MyText>

      <MyButton
        width="full"
        text={t('playground.toastConfirmInfoHideClose')}
        size="small"
        type="primary"
        onPress={async () => {
          await Confirmation.confirm({
            hideClose: true,
            message: t('playground.confirmInfoMessage'),
            type: 'info',
            confirmText: t('playground.confirmAgree'),
          })
        }}
      />
      <MyButton
        width="full"
        text={t('playground.toastConfirmWarningTwoButtons')}
        size="small"
        type="secondary"
        onPress={async () => {
          await Confirmation.confirm({
            message: t('playground.confirmWarningMessage'),
            description: t('playground.confirmWarningDescription'),
            type: 'warning',
            confirmText: t('playground.confirmDelete'),
            cancelText: t('playground.confirmNo'),
          })
        }}
      />
      <MyButton
        width="full"
        text={t('playground.toastConfirmInfoWithClose')}
        size="small"
        type="tertiary"
        onPress={async () => {
          await Confirmation.confirm({
            message: t('playground.confirmInfoWithCloseMessage'),
            type: 'info',
            confirmText: t('common.confirm'),
            cancelText: t('common.cancel'),
          })
        }}
      />
    </ScrollView>
  )
}
