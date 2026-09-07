export type PlaygroundTableItem = {
  id: string
  name: string
  category: string
  branch: string
}

const CATEGORIES = ['Đồ uống', 'Bánh kẹo', 'Gia vị', 'Đồ khô']
const BRANCHES = ['Chi nhánh 1', 'Chi nhánh 2', 'Chi nhánh 3']

export const PLAYGROUND_TABLE_ITEMS: PlaygroundTableItem[] = Array.from(
  { length: 12 },
  (_, index) => ({
    id: `item-${index + 1}`,
    name: `Sản phẩm demo ${index + 1}`,
    category: CATEGORIES[index % CATEGORIES.length],
    branch: BRANCHES[index % BRANCHES.length],
  }),
)
