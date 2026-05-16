import { Hono } from 'hono'
import { type Env } from '@/types'
import { adminAuthMiddleware } from '@/middleware/adminAuth'
import { buildImageKey, getPublicUrl } from '@/services/r2'

const app = new Hono<{ Bindings: Env }>()

app.use('*', adminAuthMiddleware)

// POST /api/admin/uploads/image
// Recibe el archivo directamente y lo guarda en R2
app.post('/image', async c => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  const productId = formData.get('product_id') as string | null

  if (!file || !productId) {
    return c.json({ error: 'Archivo y product_id requeridos' }, 400)
  }

  const key = buildImageKey(productId, file.name)
  const buffer = await file.arrayBuffer()

  await c.env.IMAGES.put(key, buffer, {
    httpMetadata: { contentType: file.type },
  })

  const url = getPublicUrl(c.env, key)
  return c.json({ data: { url, key } }, 201)
})

export default app
