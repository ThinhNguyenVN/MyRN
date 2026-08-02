export { default } from './my-bottom-sheet'
export type { MyBottomSheetProps, MyBottomSheetRef } from './type'

/** Re-exports so features never import `@expo/ui` directly. */
export {
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@expo/ui/community/bottom-sheet'
