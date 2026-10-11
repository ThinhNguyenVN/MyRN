import type { ChatAdapter, ChatRequest, ChatStreamHandlers } from './chat-adapter'
import { generateMessageId } from './generate-message-id'
import type {
  ChatFormValues,
  ChatMessage,
  ChatSummaryField,
  ConfirmationMessage,
  ConversationEvent,
} from './types'

const CHUNK_DELAY_MS = 120
/** Hold pending/empty state so playground can preview `MyChatTyping` before chunks arrive. */
const THINKING_DELAY_MS = 2500

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function streamChunks(
  messageId: string,
  chunks: string[],
  handlers: ChatStreamHandlers,
): Promise<void> {
  await sleep(THINKING_DELAY_MS)
  for (const chunk of chunks) {
    await sleep(CHUNK_DELAY_MS)
    handlers.onTextChunk(messageId, chunk)
  }
}

function pendingTextMessage(id: string): ChatMessage {
  return {
    id,
    role: 'assistant',
    createdAt: Date.now(),
    status: 'pending',
    kind: 'text',
    text: '',
  }
}

function isProductCreationIntent(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  return normalized.includes('tạo sản phẩm') || normalized.includes('tao san pham')
}

function buildOptionsMessage(): ChatMessage {
  return {
    id: generateMessageId('options'),
    role: 'assistant',
    createdAt: Date.now(),
    status: 'complete',
    kind: 'options',
    prompt: 'Bạn muốn tạo loại sản phẩm nào?',
    options: [
      { id: 'phone', label: 'Điện thoại' },
      { id: 'accessory', label: 'Phụ kiện' },
      { id: 'other', label: 'Khác' },
    ],
  }
}

function buildFormMessage(): ChatMessage {
  return {
    id: generateMessageId('form'),
    role: 'assistant',
    createdAt: Date.now(),
    status: 'complete',
    kind: 'form',
    title: 'Nhập thông tin sản phẩm',
    submitLabel: 'Tiếp tục',
    fields: [
      { name: 'name', label: 'Tên sản phẩm', type: 'text', required: true },
      { name: 'price', label: 'Giá (đ)', type: 'number', required: true },
      { name: 'stock', label: 'Tồn kho', type: 'number', required: true },
    ],
  }
}

function summaryFromFormValues(values: ChatFormValues): ChatSummaryField[] {
  return [
    { label: 'Tên sản phẩm', value: String(values.name ?? '') },
    { label: 'Giá', value: `${values.price ?? ''}đ` },
    { label: 'Tồn kho', value: String(values.stock ?? '') },
  ]
}

function buildConfirmationMessage(values: ChatFormValues): ChatMessage {
  return {
    id: generateMessageId('confirmation'),
    role: 'assistant',
    createdAt: Date.now(),
    status: 'complete',
    kind: 'confirmation',
    prompt: 'Tạo sản phẩm?',
    summary: summaryFromFormValues(values),
    confirmLabel: 'Tạo',
    cancelLabel: 'Hủy',
  }
}

function buildResultMessage(values: ChatFormValues): ChatMessage {
  return {
    id: generateMessageId('result'),
    role: 'assistant',
    createdAt: Date.now(),
    status: 'complete',
    kind: 'result',
    title: '✓ Đã tạo sản phẩm',
    summary: summaryFromFormValues(values),
    actions: [
      { type: 'custom', id: 'view-product', label: 'Xem sản phẩm →' },
      { type: 'navigate', label: 'Về danh sách component →', href: '/playground' },
      {
        type: 'external_link',
        label: 'Đọc thêm hướng dẫn ↗',
        url: 'https://reactnative.dev',
      },
    ],
  }
}

function isCardLockIntent(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  return normalized.includes('hết hạn') || normalized.includes('het han')
}

/** Mô phỏng contract v2: khóa các thẻ còn mở trong history và gửi thẻ mới có `changedFields`. */
async function handleCardLock(history: ChatMessage[], handlers: ChatStreamHandlers): Promise<void> {
  const id = generateMessageId('assistant')
  handlers.onMessageStart(pendingTextMessage(id))
  await streamChunks(id, ['Thẻ', ' cũ đã hết hạn,', ' đây là thẻ mới.'], handlers)

  for (const message of history) {
    const isOpenCard =
      (message.kind === 'options' && message.selectedOptionId === undefined) ||
      (message.kind === 'confirmation' && message.resolution === undefined)
    if (isOpenCard && message.lockState === undefined) {
      handlers.onCardState(message.id, 'expired')
    }
  }

  handlers.onMessage({
    ...(buildConfirmationMessage({
      name: 'Áo thun',
      price: 150000,
      stock: 20,
    }) as ConfirmationMessage),
    changedFields: ['Giá'],
  })
  handlers.onDone(id)
}

async function handleSendText(
  text: string,
  history: ChatMessage[],
  handlers: ChatStreamHandlers,
): Promise<void> {
  if (isCardLockIntent(text)) {
    return handleCardLock(history, handlers)
  }
  const id = generateMessageId('assistant')
  handlers.onMessageStart(pendingTextMessage(id))

  if (isProductCreationIntent(text)) {
    await streamChunks(id, ['Đang', ' kiểm tra', ' loại sản phẩm...'], handlers)
    handlers.onMessage(buildOptionsMessage())
  } else {
    await streamChunks(id, ['Bạn', ' vừa nói:', ` "${text}"`], handlers)
  }

  handlers.onDone(id)
}

async function handleSendImages(handlers: ChatStreamHandlers): Promise<void> {
  const id = generateMessageId('assistant')
  handlers.onMessageStart(pendingTextMessage(id))
  await streamChunks(id, ['Đã', ' nhận ảnh,', ' cảm ơn bạn!'], handlers)
  handlers.onDone(id)
}

async function handleSelectOption(handlers: ChatStreamHandlers): Promise<void> {
  const id = generateMessageId('assistant')
  handlers.onMessageStart(pendingTextMessage(id))
  await streamChunks(id, ['Đang', ' chuẩn bị form...'], handlers)
  handlers.onMessage(buildFormMessage())
  handlers.onDone(id)
}

async function handleSubmitForm(
  values: ChatFormValues,
  handlers: ChatStreamHandlers,
): Promise<void> {
  const id = generateMessageId('assistant')
  handlers.onMessageStart(pendingTextMessage(id))
  await streamChunks(id, ['Đang', ' kiểm tra thông tin...'], handlers)
  handlers.onMessage(buildConfirmationMessage(values))
  handlers.onDone(id)
}

async function handleConfirm(
  confirmed: boolean,
  history: ChatMessage[],
  handlers: ChatStreamHandlers,
): Promise<void> {
  const id = generateMessageId('assistant')
  handlers.onMessageStart(pendingTextMessage(id))

  if (!confirmed) {
    await streamChunks(id, ['Đã', ' hủy tạo sản phẩm.'], handlers)
    handlers.onDone(id)
    return
  }

  const formMessage = history.find((message) => message.kind === 'form')
  const values = formMessage?.kind === 'form' ? (formMessage.submittedValues ?? {}) : {}

  await streamChunks(id, ['Đang', ' xử lý...'], handlers)
  handlers.onMessage(buildResultMessage(values))
  handlers.onDone(id)
}

function dispatchEvent(
  event: ConversationEvent,
  history: ChatMessage[],
  handlers: ChatStreamHandlers,
): Promise<void> {
  switch (event.type) {
    case 'send_text':
      return handleSendText(event.text, history, handlers)
    case 'send_images':
      return handleSendImages(handlers)
    case 'select_option':
      return handleSelectOption(handlers)
    case 'submit_form':
      return handleSubmitForm(event.values, handlers)
    case 'confirm':
      return handleConfirm(event.confirmed, history, handlers)
    case 'retry':
      return Promise.resolve()
    default:
      return Promise.resolve()
  }
}

/** Script hoá kịch bản "Tạo sản phẩm" cho playground — không gọi network, không AI thật. */
export const MockChatAdapter: ChatAdapter = {
  send(request: ChatRequest, handlers: ChatStreamHandlers): Promise<void> {
    return dispatchEvent(request.event, request.history, handlers)
  },
}
