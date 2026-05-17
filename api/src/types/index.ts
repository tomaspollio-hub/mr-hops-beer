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

export interface Env {
  DB: D1Database
  IMAGES: R2Bucket
  JWT_SECRET: string
  RESEND_API_KEY: string
  ADMIN_EMAIL: string
  FRONTEND_URL: string
  R2_PUBLIC_URL: string
  ENVIRONMENT: string
  GOOGLE_CLIENT_ID: string
  MERCADOPAGO_ACCESS_TOKEN: string
}

// Valid status transitions
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_confirmation: ['confirmed', 'cancelled'],
  confirmed:           ['in_preparation', 'cancelled'],
  in_preparation:      ['ready', 'cancelled'],
  ready:               ['delivered', 'cancelled'],
  delivered:           [],
  cancelled:           [],
}

export const RESERVATION_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  pending_confirmation: ['confirmed', 'cancelled'],
  confirmed:            ['barrel_delivered', 'cancelled'],
  barrel_delivered:     ['barrel_returned'],
  barrel_returned:      [],
  cancelled:            [],
}
