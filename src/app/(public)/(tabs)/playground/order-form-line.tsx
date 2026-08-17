import { memo, useCallback, useMemo } from 'react'
import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import MyButton from '@/components/elements/my-button'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { MyForm, useFormContext } from '@/components/form'
import { OrderFormLineEditor } from '@/components/ui/order-form-line'
import { generateStyles } from '@/features/playground/styles'
import { useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { useThemedStyles } from '@/theme/theme-context'

const lineSchema = z.object({
  product_id: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.string().min(1),
  unit_price: z.string().min(1),
  note: z.string().optional(),
})

const formSchema = z.object({
  items: z.array(lineSchema).min(1),
})

type FormValues = z.input<typeof formSchema>

const defaultValues: FormValues = {
  items: [{ product_id: 'p1', unit: 'u1', quantity: '2', unit_price: '150000', note: '' }],
}

const PRODUCTS = [
  { id: 'p1', unit_id: 'u1' },
  { id: 'p2', unit_id: 'u2' },
]

type DemoLineProps = {
  index: number
  fieldId: string
  productOptions: { label: string; value: string }[]
  unitOptions: { label: string; value: string }[]
  compact: boolean
  canRemove: boolean
  isLast: boolean
  onRemove: (index: number) => void
}

const DemoLine = memo(function DemoLine({
  index,
  fieldId,
  productOptions,
  unitOptions,
  compact,
  canRemove,
  isLast,
  onRemove,
}: DemoLineProps) {
  return (
    <OrderFormLineEditor
      key={`order-line-${fieldId}`}
      index={index}
      productOptions={productOptions}
      unitOptions={unitOptions}
      products={PRODUCTS}
      disabled={false}
      compact={compact}
      canRemove={canRemove}
      isLast={isLast}
      onRemove={onRemove}
      isProductsLoading={false}
      isUnitsLoading={false}
    />
  )
})

function OrderFormLineDemoBody() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const isMobileSize = useIsMobileSize()
  const compact = !isMobileSize
  const { control } = useFormContext<FormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const productOptions = useMemo(
    () => [
      { label: t('playground.orderFormLineProductA'), value: 'p1' },
      { label: t('playground.orderFormLineProductB'), value: 'p2' },
    ],
    [t],
  )
  const unitOptions = useMemo(
    () => [
      { label: t('playground.orderFormLineUnitBox'), value: 'u1' },
      { label: t('playground.orderFormLineUnitPack'), value: 'u2' },
    ],
    [t],
  )

  const handleRemove = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index)
      }
    },
    [fields.length, remove],
  )

  const handleAdd = useCallback(() => {
    append({ product_id: '', unit: '', quantity: '1', unit_price: '0', note: '' })
  }, [append])

  const lines = fields.map((field, index) => (
    <DemoLine
      key={`order-line-${field.id}`}
      fieldId={field.id}
      index={index}
      productOptions={productOptions}
      unitOptions={unitOptions}
      compact={compact}
      canRemove={fields.length > 1}
      isLast={index === fields.length - 1}
      onRemove={handleRemove}
    />
  ))

  return (
    <MyView style={styles.screenContent}>
      <MyText typography="body">{t('playground.orderFormLineIntro')}</MyText>
      {lines}
      <MyButton
        text={t('playground.orderFormLineAdd')}
        type="secondary"
        size="small"
        width="auto"
        elevation="none"
        onPress={handleAdd}
      />
    </MyView>
  )
}

export default function OrderFormLineScreen() {
  return (
    <MyForm<FormValues> schema={formSchema} defaultValues={defaultValues} mode="onChange">
      <OrderFormLineDemoBody />
    </MyForm>
  )
}
