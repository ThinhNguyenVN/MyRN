import { resolveHysteresisVisible } from './responsive-visibility'

describe('resolveHysteresisVisible', () => {
  it('không có trạng thái trước (lần đo đầu tiên) — dùng ngưỡng đơn giản', () => {
    expect(resolveHysteresisVisible(1200, 1000, undefined, 24)).toBe(true)
    expect(resolveHysteresisVisible(900, 1000, undefined, 24)).toBe(false)
  })

  it('đang hiện, width tụt xuống dưới ngưỡng hide → ẩn ngay', () => {
    expect(resolveHysteresisVisible(999, 1000, true, 24)).toBe(false)
  })

  it('đang hiện, width dao động nhẹ quanh ngưỡng nhưng vẫn >= ngưỡng → giữ hiện', () => {
    expect(resolveHysteresisVisible(1000, 1000, true, 24)).toBe(true)
  })

  it('đang ẩn, width tăng nhưng chưa vượt qua vùng dead-zone → vẫn giữ ẩn (chặn giựt)', () => {
    // Bug thật: nếu show lại ngay tại ngưỡng hide (1000) thì 1 dao động ±5px quanh 1000 do
    // scrollbar gây ra sẽ làm cột ẩn/hiện liên tục — phải vượt qua 1000+24=1024 mới được hiện lại.
    expect(resolveHysteresisVisible(1010, 1000, false, 24)).toBe(false)
    expect(resolveHysteresisVisible(1023, 1000, false, 24)).toBe(false)
  })

  it('đang ẩn, width vượt qua ngưỡng show (hideBelow + margin) → hiện lại', () => {
    expect(resolveHysteresisVisible(1024, 1000, false, 24)).toBe(true)
  })

  it('mô phỏng dao động ±10px quanh ngưỡng 1000 (biên độ nhỏ hơn margin 24) → trạng thái không bao giờ đổi sau khi ổn định', () => {
    let visible: boolean | undefined = undefined
    // Lần đầu ở đúng ngưỡng biên dưới (995) → ẩn.
    visible = resolveHysteresisVisible(995, 1000, visible, 24)
    expect(visible).toBe(false)
    // Dao động qua lại 995 <-> 1010 (biên độ 15px, nhỏ hơn margin 24) — phải giữ nguyên ẩn mãi,
    // không được bật lại (đây chính là hành vi đã gây giựt UI liên tục trước khi có hysteresis).
    for (let i = 0; i < 5; i += 1) {
      visible = resolveHysteresisVisible(1010, 1000, visible, 24)
      expect(visible).toBe(false)
      visible = resolveHysteresisVisible(995, 1000, visible, 24)
      expect(visible).toBe(false)
    }
  })
})
