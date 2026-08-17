import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useWatch } from 'react-hook-form'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyFormDropdown, MyFormTextInput, useFormContext } from '@/components/form'
import { useThemedStyles } from '@/theme/theme-context'
import { formatDisplayNumber } from '@/utils/format-display-number'

import { OrderFormLineNote } from './order-form-line-note'
import { OrderProductThumb } from './order-product-thumb'
import { generateStyles } from './styles'
import type { OrderFormLineEditorProps } from './type'
import { orderLineTotal } from './utils'

function OrderFormLineEditorComponent({
  index,
  productOptions,
  unitOptions,
  products,
  disabled,
  compact,
  canRemove,
  isLast,
  onRemove,
  isProductsLoading,
  isUnitsLoading,
  syncKey,
  onProductChange,
}: OrderFormLineEditorProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const { setValue } = useFormContext()

  const productId = useWatch({ name: `items.${index}.product_id` }) as string
  const quantity = useWatch({ name: `items.${index}.quantity` }) as string
  const unitPrice = useWatch({ name: `items.${index}.unit_price` }) as string
  const previousProductId = useRef(productId)
  const isInitialRef = useRef(true)

  useEffect(() => {
    const product = products.find((item) => item.id === productId)
    const productChanged = previousProductId.current !== productId
    const isInitial = isInitialRef.current
    isInitialRef.current = false
    previousProductId.current = productId
    if (!isInitial && productChanged && product) {
      setValue(`items.${index}.unit`, product.unit_id ?? '')
    }
    onProductChange?.({ productId, product, productChanged, isInitial })
  }, [index, onProductChange, productId, products, setValue, syncKey])

  const handleRemove = useCallback(() => {
    onRemove(index)
  }, [index, onRemove])

  const totalText = useMemo(() => {
    const total = orderLineTotal(quantity, unitPrice)
    return `${formatDisplayNumber(total, { locale: 'vi' })} đ`
  }, [quantity, unitPrice])

  const selectedProductImageUrl = productOptions.find(
    (option) => option.value === productId,
  )?.imageUrl
  const productThumb = <OrderProductThumb imageUrl={selectedProductImageUrl} />

  const productField = (
    <MyFormDropdown
      name={`items.${index}.product_id`}
      title={compact ? undefined : t('components.orderFormLine.product')}
      pickerTitle={t('components.orderFormLine.product')}
      placeholder={t('components.orderFormLine.productPlaceholder')}
      options={productOptions}
      required
      disabled={disabled}
      loading={isProductsLoading}
    />
  )
  const unitField = (
    <MyFormDropdown
      name={`items.${index}.unit`}
      title={compact ? undefined : t('components.orderFormLine.unit')}
      pickerTitle={t('components.orderFormLine.unit')}
      placeholder={t('components.orderFormLine.unitPlaceholder')}
      options={unitOptions}
      required
      searchable={false}
      preferSheet
      disabled={disabled}
      loading={isUnitsLoading}
    />
  )
  const qtyField = (
    <MyFormTextInput
      name={`items.${index}.quantity`}
      title={compact ? undefined : t('components.orderFormLine.quantity')}
      placeholder={t('components.orderFormLine.quantityPlaceholder')}
      keyboardType="decimal-pad"
      numberFormat={{ locale: 'vi', maxFractionDigits: 2 }}
      disabled={disabled}
      inputStyle={compact ? undefined : styles.mobileNumericInput}
    />
  )
  const priceField = (
    <MyFormTextInput
      name={`items.${index}.unit_price`}
      title={compact ? undefined : t('components.orderFormLine.unitPrice')}
      placeholder={t('components.orderFormLine.unitPricePlaceholder')}
      keyboardType="decimal-pad"
      numberFormat={{ locale: 'vi', maxFractionDigits: 2 }}
      disabled={disabled}
      inputStyle={compact ? undefined : styles.mobileNumericInput}
      inputRowStyle={compact ? undefined : styles.mobilePriceInputRow}
    />
  )
  const noteChrome = <OrderFormLineNote index={index} disabled={disabled} />
  const tableDeleteButton =
    canRemove && !disabled ? (
      <MyButton.Icon
        icon="trash-outline"
        type="light"
        size="small"
        elevation="none"
        onPress={handleRemove}
        accessibilityLabel={t('components.orderFormLine.removeLine')}
      />
    ) : null
  const mobileRemoveButton =
    canRemove && !disabled ? (
      <MyButton.Icon
        icon="trash-outline"
        type={'light'}
        size="small"
        elevation="none"
        onPress={handleRemove}
        accessibilityLabel={t('components.orderFormLine.removeLine')}
      />
    ) : null
  const lineBlockStyle = isLast ? [styles.lineBlock, styles.lineBlockLast] : styles.lineBlock

  if (compact) {
    return (
      <MyView style={lineBlockStyle}>
        <MyView style={styles.tableRow}>
          <MyView style={styles.colProduct}>
            <MyView style={[styles.productFieldRow, styles.productFieldRowCompact]}>
              {productThumb}
              <MyView style={styles.productFieldControl}>{productField}</MyView>
            </MyView>
          </MyView>
          <MyView style={styles.colUnit}>{unitField}</MyView>
          <MyView style={styles.colQty}>{qtyField}</MyView>
          <MyView style={styles.colPrice}>{priceField}</MyView>
          <MyView style={styles.colTotal}>
            <MyText typography="subtitle" style={styles.lineTotal}>
              {totalText}
            </MyText>
          </MyView>
          <MyView style={styles.colDelete}>{tableDeleteButton}</MyView>
        </MyView>
        <MyView style={styles.colProduct}>{noteChrome}</MyView>
      </MyView>
    )
  }

  return (
    <MyView style={styles.mobileLineCard}>
      <MyView style={styles.mobileProductBlock}>
        <MyView style={[styles.productFieldRow, styles.productFieldRowLabeled]}>
          {productThumb}
          <MyView style={styles.productFieldControl}>{productField}</MyView>
        </MyView>
      </MyView>
      {noteChrome}
      <MyView style={styles.mobileFieldRow}>
        <MyView style={styles.mobileFieldHalf}>{unitField}</MyView>
        <MyView style={styles.mobileFieldHalf}>{qtyField}</MyView>
      </MyView>
      {priceField}
      <MyView style={styles.mobileLineTotalRow}>
        {mobileRemoveButton}
        <MyText typography="subtitle" style={[styles.lineTotal, styles.mobileLineTotalValue]}>
          {totalText}
        </MyText>
      </MyView>
    </MyView>
  )
}

export const OrderFormLineEditor = memo(OrderFormLineEditorComponent)
