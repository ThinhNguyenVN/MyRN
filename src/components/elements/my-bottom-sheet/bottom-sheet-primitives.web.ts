/**
 * Web: `BottomSheetView`/`BottomSheetScrollView`/`BottomSheetFlatList`/`BottomSheetTextInput`
 * từ `@expo/ui/community/bottom-sheet` chỉ là re-export thẳng `View`/`ScrollView`/`FlatList`/
 * `TextInput` của React Native — nhưng import bất kỳ export nào từ module đó cũng kéo theo
 * `BottomSheetModal` (dùng `vaul` + nhiều `@radix-ui/*`, ~90KB minified) vì Metro không
 * tree-shake theo từng export riêng lẻ trong 1 file. Nhánh `BottomSheetModal` chưa từng chạy
 * trên web (`my-bottom-sheet.native.tsx` mới dùng tới — xem `expo-ssr-gap-analysis.md`, Phát
 * hiện #5), nên ở đây tự định nghĩa lại các alias này thẳng từ `react-native` để tránh import
 * cả module `@expo/ui/community/bottom-sheet`.
 */
export {
  View as BottomSheetView,
  ScrollView as BottomSheetScrollView,
  FlatList as BottomSheetFlatList,
  TextInput as BottomSheetTextInput,
} from 'react-native'
