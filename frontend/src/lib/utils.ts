import { clsx, type ClassValue } from 'clsx'
import { type OrderStatus, type ReservationStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function orderWhatsAppMessage(orderNumber: string): string {
  return `¡Hola Mr. Hops Beer! Hice el pedido ${orderNumber} y quiero coordinar el pago y la entrega. ¡Gracias!`
}

export function reservationWhatsAppMessage(reservationNumber: string): string {
  return `¡Hola Mr. Hops Beer! Hice la reserva de barril ${reservationNumber} y quiero coordinar los detalles. ¡Gracias!`
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_confirmation: 'Pendiente de confirmación',
  confirmed:           'Confirmado',
  in_preparation:      'En preparación',
  ready:               'Listo para entrega',
  delivered:           'Entregado',
  cancelled:           'Cancelado',
}

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  pending_confirmation: 'Pendiente de confirmación',
  confirmed:            'Confirmada',
  barrel_delivered:     'Barril entregado',
  barrel_returned:      'Barril devuelto',
  cancelled:            'Cancelada',
}

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending_confirmation: 'bg-hops-gold/20 text-hops-gold',
  confirmed:            'bg-blue-500/20 text-blue-400',
  in_preparation:       'bg-purple-500/20 text-purple-400',
  ready:                'bg-hops-green/20 text-hops-green',
  delivered:            'bg-gray-500/20 text-gray-400',
  cancelled:            'bg-red-500/20 text-red-400',
}

export const RESERVATION_STATUS_COLOR: Record<ReservationStatus, string> = {
  pending_confirmation: 'bg-hops-gold/20 text-hops-gold',
  confirmed:            'bg-blue-500/20 text-blue-400',
  barrel_delivered:     'bg-hops-green/20 text-hops-green',
  barrel_returned:      'bg-gray-500/20 text-gray-400',
  cancelled:            'bg-red-500/20 text-red-400',
}
