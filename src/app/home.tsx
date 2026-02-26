import React from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'

const Home: React.FC = () => {
  return (
    <MyView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <MyText typography="h5">Welcome Home</MyText>
    </MyView>
  )
}

export default Home
