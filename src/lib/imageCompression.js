import imageCompression from 'browser-image-compression'

const IMAGE_TYPES = ['image/png', 'image/jpeg']

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  initialQuality: 0.8,
}

/**
 * Görselleri sıkıştırır, PDF dosyalarına dokunmaz.
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressImageFile(file) {
  if (!IMAGE_TYPES.includes(file.type)) return file

  const compressed = await imageCompression(file, COMPRESSION_OPTIONS)
  return new File([compressed], file.name, { type: compressed.type })
}
