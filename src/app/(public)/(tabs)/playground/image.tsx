import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyImage from '@/components/elements/my-image'
import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from '@/features/playground/styles'

export default function ImageScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection1')}
      </MyText>
      <MyImage
        url="https://picsum.photos/200/150"
        width={200}
        marginTop={20}
        marginBottom={20}
        alignSelf="center"
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection2')}
      </MyText>
      <MyImage source={require('@/assets/images/react-logo.png')} style={styles.smallImageMargin} />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection3')}
      </MyText>
      <MyImage style={styles.image200x120} />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection4')}
      </MyText>
      <MyImage showMessage emptyMessage={t('components.imageEmpty')} style={styles.image200x120} />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection5')}
      </MyText>
      <MyImage url="https://invalid-url-will-fail.example/img.jpg" width={100} alignSelf="center" />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection6')}
      </MyText>
      <MyImage
        url="https://invalid-url-will-fail.example/img.jpg"
        showMessage
        errorMessage={t('components.imageError')}
        style={styles.image200x120}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection7')}
      </MyText>
      <MyImage
        url="https://picsum.photos/200/100"
        onPress={() => alert(t('playground.imagePressed'))}
        style={styles.image200x100}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection8')}
      </MyText>
      <MyImage
        url="https://picsum.photos/180/100"
        elevation="soft/down/small"
        style={styles.image180x100}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection9')}
      </MyText>
      <MyImage
        url="https://picsum.photos/200/200"
        contentFit="contain"
        style={styles.image150x150}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection10')}
      </MyText>
      <MyImage
        emptyContent={
          <MyView padding={24} alignItems="center" gap={8}>
            <MyIcon name="add-circle-outline" size={40} color="icon/inactive/primary" />
            <MyText typography="caption" color="text/inactive/primary">
              {t('playground.imageAdd')}
            </MyText>
          </MyView>
        }
        style={styles.image200x100}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection11')}
      </MyText>
      <MyImage url="https://picsum.photos/200/120" priority="high" style={styles.image200x120} />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageSection12')}
      </MyText>
      <MyImage
        url="https://invalid-url.example/img.jpg"
        errorContent={
          <MyView style={styles.errorContent}>
            <MyIcon name="refresh-outline" size={28} color="icon/alert/primary" />
            <MyText typography="caption" color="text/alert/primary">
              {t('components.imageError')}
            </MyText>
          </MyView>
        }
        style={styles.image200x100}
      />
      <MyText typography="label" style={styles.labelMargin}>
        {t('playground.imageLockAspectOff')}
      </MyText>
      <MyImage
        url="https://picsum.photos/320/180"
        lockAspectRatio={false}
        contentFit="cover"
        style={styles.image200x100}
      />
    </ScrollView>
  )
}
