// ─── Enums ────────────────────────────────────────────────────────────────────

export type ProductCategory = 'lata' | 'pet' | 'pack' | 'barril' | 'accesorio'

export type DeliveryType = 'delivery' | 'pickup'

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'in_preparation'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export type ReservationStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'barrel_delivered'
  | 'barrel_returned'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

// ─── Models ───────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category: ProductCategory
  price: number
  image_url?: string
  stock: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface BarrelVariant {
  id: string
  product_id: string
  liters: number
  price_per_day: number
  deposit: number
  stock: number
  product?: Product
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  product?: Product
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  delivery_type: DeliveryType
  delivery_address?: string
  notes?: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_id?: string
  subtotal: number
  total: number
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export interface ReservationAccessory {
  id: string
  reservation_id: string
  product_id: string
  quantity: number
  unit_price: number
  product?: Product
}

export interface BarrelReservation {
  id: string
  reservation_number: string
  user_id?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  barrel_variant_id: string
  start_date: string
  end_date: string
  delivery_type: DeliveryType
  delivery_address?: string
  notes?: string
  status: ReservationStatus
  payment_status: PaymentStatus
  payment_id?: string
  total: number
  deposit_amount: number
  accessories?: ReservationAccessory[]
  barrel_variant?: BarrelVariant
  created_at: string
  updated_at: string
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface CheckoutForm {
  name: string
  email: string
  phone: string
  delivery_type: DeliveryType
  delivery_address?: string
  notes?: string
}

export interface ReservationForm extends CheckoutForm {
  barrel_variant_id: string
  start_date: string
  end_date: string
  accessories: { product_id: string; quantity: number }[]
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  phone?: string
  password: string
}
