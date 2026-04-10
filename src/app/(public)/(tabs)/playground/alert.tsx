import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyAlert from '@/components/elements/my-alert'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

export default function AlertScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.alertSectionInfo')}
      </MyText>
      <MyAlert
        type="info"
        title={t('playground.alertInfoTitle')}
        message={t('playground.alertInfoMessage')}
        description={t('playground.alertInfoDescription')}
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.alertSectionSuccess')}
      </MyText>
      <MyAlert
        type="success"
        title={t('playground.alertSuccessTitle')}
        message={t('playground.alertSuccessMessage')}
        description={t('playground.alertSuccessDescription')}
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.alertSectionWarning')}
      </MyText>
      <MyAlert
        type="warning"
        title={t('playground.alertWarningTitle')}
        message={t('playground.alertWarningMessage')}
        description={t('playground.alertWarningDescription')}
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.alertSectionError')}
      </MyText>
      <MyAlert
        type="error"
        title={t('playground.alertErrorTitle')}
        message={t('playground.alertErrorMessage')}
        description={t('playground.alertErrorDescription')}
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.alertSectionCustomIcon')}
      </MyText>
      <MyAlert
        type="info"
        icon="notifications"
        message={t('playground.alertCustomIconMessage')}
        description={t('playground.alertCustomIconDescription')}
        style={styles.alertMargin}
        onClose={() => {}}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.alertSectionWithImage')}
      </MyText>
      <MyAlert
        type="success"
        image={require('@/assets/images/react-logo.png')}
        message={t('playground.alertImageMessage')}
        description={t('playground.alertImageDescription')}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.alertSectionMinimal')}
      </MyText>
      <MyAlert
        type="warning"
        message={t('playground.alertMinimalMessage')}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.alertSectionWithElevation')}
      </MyText>
      <MyAlert
        type="success"
        title={t('playground.alertSuccessTitle')}
        message={t('playground.alertElevationMessage')}
        elevation="soft/down/small"
        onClose={() => {}}
        style={styles.alertMargin}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.alertSectionWithButtons')}
      </MyText>
      <MyAlert
        type="info"
        title={t('playground.alertButtonsTitle')}
        message={t('playground.alertButtonsMessage')}
        description={t('playground.alertButtonsDescription')}
        onClose={() => {}}
        buttons={[
          { text: t('common.cancel'), type: 'tertiary', onPress: () => {} },
          { text: t('common.confirm'), type: 'primary', onPress: () => {} },
        ]}
        style={styles.alertMargin}
      />
    </ScrollView>
  )
}
