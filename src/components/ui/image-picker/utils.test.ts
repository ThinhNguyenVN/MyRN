import * as ImagePicker from 'expo-image-picker'

import {
  buildImageFormData,
  IMAGE_PICK_MAX_BYTES,
  ImagePickError,
  pickedImageFromFile,
  pickImageFromCamera,
  pickImages,
} from './utils'
import type { PickedImage } from './type'

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
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

describe('pickImageFromCamera', () => {
  const requestCameraPermissionsAsync = ImagePicker.requestCameraPermissionsAsync as jest.Mock
  const launchCameraAsync = ImagePicker.launchCameraAsync as jest.Mock

  beforeEach(() => {
    requestCameraPermissionsAsync.mockReset()
    launchCameraAsync.mockReset()
  })

  it('returns a PickedImage on success', async () => {
    requestCameraPermissionsAsync.mockResolvedValue({ granted: true })
    launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/photo.jpg', mimeType: 'image/jpeg', fileSize: 100 }],
    })

    const picked = await pickImageFromCamera()

    expect(picked).toMatchObject({
      uri: 'file:///tmp/photo.jpg',
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
      size: 100,
    })
  })

  it('throws permission_denied when camera permission is not granted', async () => {
    requestCameraPermissionsAsync.mockResolvedValue({ granted: false })

    await expect(pickImageFromCamera()).rejects.toMatchObject({ code: 'permission_denied' })
    expect(launchCameraAsync).not.toHaveBeenCalled()
  })

  it('throws cancelled when the user backs out', async () => {
    requestCameraPermissionsAsync.mockResolvedValue({ granted: true })
    launchCameraAsync.mockResolvedValue({ canceled: true, assets: null })

    await expect(pickImageFromCamera()).rejects.toMatchObject({ code: 'cancelled' })
  })
})

describe('pickImages', () => {
  const requestMediaLibraryPermissionsAsync =
    ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
  const launchImageLibraryAsync = ImagePicker.launchImageLibraryAsync as jest.Mock

  beforeEach(() => {
    requestMediaLibraryPermissionsAsync.mockReset().mockResolvedValue({ granted: true })
    launchImageLibraryAsync.mockReset()
  })

  it('skips an unsupported asset instead of failing the whole batch', async () => {
    launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        { uri: 'file:///tmp/a.jpg', mimeType: 'image/jpeg', fileSize: 100 },
        { uri: 'file:///tmp/b.gif2', mimeType: 'application/octet-stream', fileSize: 100 },
        { uri: 'file:///tmp/c.jpg', mimeType: 'image/jpeg', fileSize: 100 },
      ],
    })

    const { images, skippedCount } = await pickImages({ selectionLimit: 5 })

    expect(images).toHaveLength(2)
    expect(images.map((image) => image.uri)).toEqual(['file:///tmp/a.jpg', 'file:///tmp/c.jpg'])
    expect(skippedCount).toBe(1)
  })

  it('returns an empty result (not a throw) when every asset is unsupported', async () => {
    launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///tmp/a.bin', mimeType: 'application/octet-stream', fileSize: 100 }],
    })

    const { images, skippedCount } = await pickImages({ selectionLimit: 5 })

    expect(images).toHaveLength(0)
    expect(skippedCount).toBe(1)
  })

  it('throws cancelled when the user backs out with no assets at all', async () => {
    launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null })

    await expect(pickImages()).rejects.toMatchObject({ code: 'cancelled' })
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
