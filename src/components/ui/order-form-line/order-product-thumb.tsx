import { memo } from 'react'

import MyIcon from '@/components/elements/my-icon'
import MyImage from '@/components/elements/my-image'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { OrderProductThumbProps } from './type'

const ProductThumbPlaceholder = memo(function ProductThumbPlaceholder() {
  const styles = useThemedStyles(generateStyles)
  const isMobileSize = useIsMobileSize()
  return (
    <MyView style={styles.productThumb}>
      <MyIcon name="cube-outline" size={isMobileSize ? 30 : 20} color="icon/inactive/primary" />
    </MyView>
  )
})

function OrderProductThumbInner({ imageUrl }: OrderProductThumbProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <ConditionRenderer when={Boolean(imageUrl)} fallback={<ProductThumbPlaceholder />}>
      <MyImage
        key={imageUrl ?? 'order-product-thumb'}
        url={imageUrl ?? undefined}
        style={styles.productThumb}
        contentFit="cover"
        showMessage={false}
        lockAspectRatio={false}
        emptyContent={<ProductThumbPlaceholder />}
        errorContent={<ProductThumbPlaceholder />}
      />
    </ConditionRenderer>
  )
}

export const OrderProductThumb = memo(OrderProductThumbInner)
