/**
 * Schmitt-trigger-style hide/show decision for a responsive column: hides as soon as `width` drops
 * below `hideBelow`, but only shows again once `width` climbs past `hideBelow + margin`.
 *
 * Dùng 1 ngưỡng duy nhất cho cả 2 chiều (ẩn/hiện) tạo vòng lặp giựt UI thật (bug 2026-09):
 * ẩn cột → nội dung bảng hẹp lại → scrollbar ngang/dọc của trang biến mất → width đo được
 * (`onLayout`) tăng lên vài px → v/qua lại đúng ngưỡng cũ → hiện cột lại → nội dung rộng ra →
 * scrollbar xuất hiện lại → width giảm → ẩn lại → lặp vô hạn, xảy ra RÕ NHẤT khi width cửa sổ nằm
 * đúng vùng biên (~vài px quanh 1 ngưỡng). Tách 2 ngưỡng (hide/show) cách nhau `margin` tạo 1 "dead
 * zone" mà 1 lần đo dao động nhỏ (do đúng scrollbar gây ra, thường ~15-17px) không thể xuyên qua cả
 * 2 chiều được nữa, nên trạng thái tự ổn định thay vì dao động mãi.
 */
export function resolveHysteresisVisible(
  width: number,
  hideBelow: number,
  wasVisible: boolean | undefined,
  margin: number,
): boolean {
  if (wasVisible === false) {
    return width >= hideBelow + margin
  }
  return width >= hideBelow
}
