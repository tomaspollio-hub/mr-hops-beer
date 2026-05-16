import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { type Product, type ProductCategory } from '@/types'

interface ProductsResponse {
  data: Product[]
}

export function useProducts(category?: ProductCategory) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const path = category ? `/products?category=${category}` : '/products'
    api.get<ProductsResponse>(path)
      .then(res => setProducts(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [category])

  return { products, loading, error }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ data: Product }>(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return { product, loading, error }
}
