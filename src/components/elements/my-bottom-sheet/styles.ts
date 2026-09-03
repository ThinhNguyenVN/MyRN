import { Radius } from '@/theme/radius'
import { MAX_INPUT_WIDTH } from '@/constants/dimensions'
import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

const HEADER_HEIGHT = 40

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing, insets } = theme
  return StyleSheet.create({
    sheet: {
      borderTopLeftRadius: Radius.medium,
      borderTopRightRadius: Radius.medium,
    },
    /** Web desktop: dialog căn giữa. */
    // theme-exempt: modal backdrop scrim stays the same dark tint in both themes.
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: getSpacing('x4'),
    },
    modalPanel: {
      width: '100%',
      maxWidth: MAX_INPUT_WIDTH,
      borderRadius: Radius.medium,
      backgroundColor: getColor('fill/background/tertiary'),
      overflow: 'hidden',
    },
    /** Web mobile-responsive: bottom sheet Android-like — neo đáy, full-width, cap chiều cao. */
    // theme-exempt: modal backdrop scrim stays the same dark tint in both themes.
    webSheetOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    webSheetPanel: {
      width: '100%',
      borderTopLeftRadius: Radius.large,
      borderTopRightRadius: Radius.large,
      backgroundColor: getColor('fill/background/tertiary'),
      overflow: 'hidden',
    },
    /** Co theo content nhưng bị giới hạn bởi maxHeight của panel → scroll bên trong. */
    webSheetScroll: {
      flexGrow: 0,
      flexShrink: 1,
    },
    /** Panel height cố định: body chiếm phần còn lại → footer luôn neo đáy. */
    webSheetScrollFixed: {
      flex: 1,
      minHeight: 0,
    },
    header: {
      height: HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getSpacing('x4'),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: getColor('border/inactive/tertiary'),
    },
    headerTitleWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: getColor('text/active/primary'),
    },
    headerClose: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: getSpacing('x4'),
    },
    /**
     * Native BottomSheetModal (SwiftUI `.sheet` / Android ModalBottomSheet) đã tự chừa
     * safe-area đáy cho nội dung — paddingBottom ở đây chỉ nên là khoảng thở thêm nhỏ,
     * không phải full x4 (sẽ bị cộng dồn với inset OS tự thêm, ra khoảng trống quá lớn).
     */
    footer: {
      paddingHorizontal: getSpacing('x4'),
      paddingTop: getSpacing('x4'),
      paddingBottom: (insets.bottom || 0) >= getSpacing('x4') ? 0 : getSpacing('x4'),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: getColor('border/inactive/tertiary'),
    },
    modalFooter: {
      padding: getSpacing('x4'),
      paddingBottom: insets.bottom || getSpacing('x4'),
    },
  })
}
