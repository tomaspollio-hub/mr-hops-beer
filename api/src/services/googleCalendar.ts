import { type Env } from '@/types'

// ─── JWT / Token ──────────────────────────────────────────────────────────────

function base64url(data: string | ArrayBuffer): string {
  const bytes =
    typeof data === 'string'
      ? new TextEncoder().encode(data)
      : new Uint8Array(data)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function getAccessToken(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    iss: env.GOOGLE_SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify(claims))
  const unsigned = `${header}.${body}`

  const pem = env.GOOGLE_SA_PRIVATE_KEY.replace(/\\n/g, '\n')
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(pem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
  const jwt = `${unsigned}.${base64url(sig)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) throw new Error(`Google token error: ${await res.text()}`)
  const { access_token } = await res.json<{ access_token: string }>()
  return access_token
}

// ─── Calendar API ─────────────────────────────────────────────────────────────

export interface ReservationEvent {
  reservation_number: string
  guest_name?: string | null
  guest_phone?: string | null
  barrel_name: string
  liters: number
  start_date: string  // YYYY-MM-DD
  end_date: string    // YYYY-MM-DD
  total: number
  deposit_amount: number
}

export async function createCalendarEvent(
  env: Env,
  reservation: ReservationEvent,
): Promise<string | null> {
  if (!env.GOOGLE_SA_EMAIL || !env.GOOGLE_SA_PRIVATE_KEY) return null

  try {
    const token = await getAccessToken(env)
    const calendarId = env.GOOGLE_CALENDAR_ID ?? 'primary'

    // Google Calendar end date for all-day events is exclusive — add 1 day
    const endDate = new Date(reservation.end_date + 'T00:00:00Z')
    endDate.setUTCDate(endDate.getUTCDate() + 1)
    const endDateStr = endDate.toISOString().slice(0, 10)

    const event = {
      summary: `🍺 Barril — ${reservation.reservation_number}`,
      description: [
        `Cliente: ${reservation.guest_name ?? 'Usuario registrado'}`,
        reservation.guest_phone ? `WhatsApp: ${reservation.guest_phone}` : null,
        `Barril: ${reservation.barrel_name} ${reservation.liters}L`,
        `Total: $${reservation.total.toLocaleString('es-AR')}`,
        `Depósito: $${reservation.deposit_amount.toLocaleString('es-AR')}`,
      ].filter(Boolean).join('\n'),
      start: { date: reservation.start_date },
      end: { date: endDateStr },
      colorId: '2', // sage green
    }

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    )

    if (!res.ok) {
      console.error('[GCal] create event error', await res.text())
      return null
    }

    const data = await res.json<{ id: string }>()
    return data.id
  } catch (err) {
    console.error('[GCal] createCalendarEvent error', err)
    return null
  }
}

export async function deleteCalendarEvent(
  env: Env,
  eventId: string,
): Promise<void> {
  if (!env.GOOGLE_SA_EMAIL || !env.GOOGLE_SA_PRIVATE_KEY || !eventId) return

  try {
    const token = await getAccessToken(env)
    const calendarId = env.GOOGLE_CALENDAR_ID ?? 'primary'

    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      },
    )
  } catch (err) {
    console.error('[GCal] deleteCalendarEvent error', err)
  }
}
