import {
  buildImageFormData,
  IMAGE_PICK_MAX_BYTES,
  ImagePickError,
  pickedImageFromFile,
} from './pick-image'
import type { PickedImage } from './type'

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}))

describe('pickedImageFromFile', () => {
  const createObjectURL = jest.fn(() => 'blob:mock')

  beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: createObjectURL,
    })
  })

  beforeEach(() => {
    createObjectURL.mockClear()
  })

  it('accepts a valid image File', () => {
    const file = new File(['abc'], 'photo.png', { type: 'image/png' })
    const picked = pickedImageFromFile(file)

    expect(picked).toMatchObject({
      uri: 'blob:mock',
      name: 'photo.png',
      mimeType: 'image/png',
      size: 3,
      file,
    })
  })

  it('rejects unsupported mime types', () => {
    const file = new File(['abc'], 'doc.pdf', { type: 'application/pdf' })
    expect(() => pickedImageFromFile(file)).toThrow(ImagePickError)
    try {
      pickedImageFromFile(file)
    } catch (error) {
      expect(error).toBeInstanceOf(ImagePickError)
      expect((error as ImagePickError).code).toBe('invalid_type')
    }
  })

  it('rejects files over the max size', () => {
    const file = new File([new Uint8Array(10)], 'big.jpg', { type: 'image/jpeg' })
    expect(() => pickedImageFromFile(file, { maxBytes: 4 })).toThrow(ImagePickError)
    try {
      pickedImageFromFile(file, { maxBytes: 4 })
    } catch (error) {
      expect((error as ImagePickError).code).toBe('too_large')
    }
  })
})

describe('buildImageFormData', () => {
  it('builds FormData for native uri/name/type payload', () => {
    const image: PickedImage = {
      uri: 'file:///tmp/probe.jpg',
      name: 'probe.jpg',
      mimeType: 'image/jpeg',
      size: 1200,
    }

    expect(buildImageFormData(image)).toBeInstanceOf(FormData)
    expect(IMAGE_PICK_MAX_BYTES).toBe(5 * 1024 * 1024)
  })

  it('prefers web File when present', () => {
    const file = new File(['x'], 'web.jpg', { type: 'image/jpeg' })
    const image: PickedImage = {
      uri: 'blob:web',
      name: 'web.jpg',
      mimeType: 'image/jpeg',
      size: 1,
      file,
    }

    expect(buildImageFormData(image, { fieldName: 'file' })).toBeInstanceOf(FormData)
  })
})
