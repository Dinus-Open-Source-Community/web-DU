export function blobToDataUrl(blob: Blob, contentType?: string): Promise<string> {
  const typedBlob =
    contentType && (!blob.type || blob.type === 'application/octet-stream')
      ? new Blob([blob], { type: contentType })
      : blob

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      if (!contentType || !result.startsWith('data:;')) {
        resolve(result)
        return
      }

      const base64 = result.split(',')[1] ?? ''
      resolve(`data:${contentType};base64,${base64}`)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca blob'))
    reader.readAsDataURL(typedBlob)
  })
}
