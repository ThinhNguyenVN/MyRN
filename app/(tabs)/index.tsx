import { Image } from 'expo-image'

import ParallaxScrollView from '@/components/ui/parallax-scroll-view'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MySurface from '@/components/elements/my-surface'
import MyView from '@/components/elements/my-view'
import { generateStyles } from './styles'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import MyIcon from '@/components/elements/my-icon'

export default function HomeScreen() {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <MyView style={styles.titleContainer}>
        <MyText typography={'subtitle'} color={'text/active/tertiary'}>
          Quéo còm !!
        </MyText>

        <MyView
          backgroundColor={'fill/active/primary'}
          margin={getSpacing('x2')}
          padding={getSpacing('x6')}
          radius={'small'}
        >
          <MyText typography="body" color="text/active/primary">
            soft/down/small
          </MyText>
        </MyView>
        <MySurface
          elevation={'soft/up/medium'}
          style={[
            {
              backgroundColor: 'red',
              marginTop: 30,
              width: 200,
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <MyText typography="body" color="text/active/primary">
            soft/down/medium
          </MyText>
        </MySurface>

        <MyText typography="subtitle" style={{ marginTop: 24, marginBottom: 8 }}>
          Buttons
        </MyText>
        <MyButton
          width={'full'}
          text="Button Primary"
          size={'large'}
          type="primary"
          onPress={() => {}}
          left={<MyIcon name={'key'} color="icon/active/tertiary" />}
          right={<MyIcon name="home" color="icon/active/tertiary" />}
          style={{ backgroundColor: 'red' }}
        />
        <MyView style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 18 }}>
          <MyButton
            width={'full'}
            text="Primary"
            size={'small'}
            type="primary"
            loading
            left={<MyIcon name={'home'} color="icon/active/tertiary" />}
            onPress={() => {}}
            style={{ marginBottom: 8 }}
          />
          <MyButton
            width={'full'}
            text="Primary"
            size={'small'}
            type="primary"
            disabled
            onPress={() => {}}
            style={{ marginBottom: 8 }}
          />
        </MyView>

        <MyButton
          text="Secondary"
          width={'auto'}
          size={'small'}
          type="secondary"
          onPress={() => {}}
          style={{ marginBottom: 8 }}
        />
        <MyButton
          width={'auto'}
          text="Tertiary"
          type="tertiary"
          onPress={() => {}}
          style={{ marginBottom: 8 }}
        />
        <MyButton
          width={'auto'}
          text="Light"
          type="light"
          onPress={() => {}}
          style={{ marginBottom: 8 }}
        />
        <MyButton
          width={'auto'}
          text="Dark"
          type="dark"
          onPress={() => {}}
          style={{ marginBottom: 8 }}
        />
        <MyButton
          text="Small"
          type="primary"
          size="small"
          onPress={() => {}}
          left={<MyIcon name={'key'} color="icon/active/tertiary" />}
        />
        <MyButton text="Loading" type="secondary" loading onPress={() => {}} />
        <MyButton text="Disabled" type="primary" onPress={() => {}} disabled />
      </MyView>
    </ParallaxScrollView>
  )
}
