import React, { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import { MyList } from '@/components/ui/my-list'
import type { ListRenderItemInfo } from '@/components/ui/my-list'
import { ScrollToHideContent } from '@/components/ui/scroll-to-hide'
import { useThemedStyles } from '@/theme/theme-context'

import { useMyListData, type Post } from './hooks'
import { PostRow } from './post-row'
import { SkeletonRow } from './skeleton-row'
import { generateStyles } from './styles'

const SKELETON_ROW_COUNT = 8
const SKELETON_LOAD_MORE_COUNT = 3

export default function MyListPlaygroundScreen() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const { list, loading, loadingMore, loadMore, hasMore } = useMyListData()
  const [refreshing, setRefreshing] = useState(false)

  const renderItem = useCallback((info: ListRenderItemInfo<Post>) => {
    return <PostRow item={info.item} />
  }, [])

  const keyExtractor = useCallback((item: Post) => `post-${item.id}`, [])

  const listFooter = useMemo(() => {
    if (!loadingMore) return null
    return (
      <View style={styles.skeletonListContainer}>
        {Array.from({ length: SKELETON_LOAD_MORE_COUNT }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </View>
    )
  }, [loadingMore, styles.skeletonListContainer])

  const listEmpty = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.skeletonListContainer}>
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      )
    }
    return (
      <View style={styles.footer}>
        <MyText typography="body" color="text/active/tertiary">
          {t('playground.myListEmpty')}
        </MyText>
      </View>
    )
  }, [loading, styles.footer, styles.skeletonListContainer, t])

  return (
    <ScrollToHideContent scrollEventThrottle={16}>
      <MyList<Post>
        data={list}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          setTimeout(() => {
            setRefreshing(false)
          }, 3000)
        }}
        onEndReached={hasMore && !loading && !loadingMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
      />
    </ScrollToHideContent>
  )
}
