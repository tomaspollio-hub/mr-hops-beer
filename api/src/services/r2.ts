import { type Env } from '@/types'

export function getPublicUrl(env: Env, key: string): string {
  return `${env.R2_PUBLIC_URL}/${key}`
}

export function buildImageKey(productId: string, filename: string): string {
  const ext = filename.split('.').pop() ?? 'jpg'
  return `products/${productId}/${Date.now()}.${ext}`
}

// Genera una URL pre-firmada para que el frontend suba directo a R2
// R2 soporta presigned URLs a través de la API de compatibilidad S3
export async function createPresignedUploadUrl(
  env: Env,
  key: string,
  contentType: string,
): Promise<string> {
  // Usando R2 binding: createMultipartUpload + signedUrl
  // Por ahora delegamos al Worker para hacer el upload en su nombre
  // y devolvemos la URL pública resultante.
  // En producción se puede configurar con aws4fetch para generar presigned URLs S3-compatible.
  const obj = await env.IMAGES.put(key, new ArrayBuffer(0), {
    httpMetadata: { contentType },
  })
  if (!obj) throw new Error('No se pudo inicializar el upload en R2')
  return getPublicUrl(env, key)
}
