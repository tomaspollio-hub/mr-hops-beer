import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Eye, EyeOff, Save, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import Spinner from '@/components/ui/Spinner'

const SENTINEL = '***SET***'

// ── Tipos ──────────────────────────────────────────────────────────────────────

type Field = {
  key: string
  label: string
  placeholder?: string
  sensitive?: boolean
  type?: 'text' | 'textarea' | 'select'
  options?: { value: string; label: string }[]
  hint?: string
}

type Section = {
  id: string
  label: string
  badge: string
  description: string
  requiredKeys: string[]
  fields: Field[]
}

// ── Definición de secciones ────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: 'afip',
    label: 'AFIP',
    badge: 'Facturación electrónica',
    description: 'Credenciales para emitir comprobantes electrónicos (ARCA). Necesario para facturar desde la app.',
    requiredKeys: ['afip_cuit', 'afip_cert', 'afip_private_key'],
    fields: [
      { key: 'afip_environment', label: 'Entorno', type: 'select',
        options: [{ value: 'homologacion', label: 'Homologación (testing)' }, { value: 'produccion', label: 'Producción' }] },
      { key: 'afip_cuit',          label: 'CUIT',          placeholder: '20-12345678-9' },
      { key: 'afip_razon_social',  label: 'Razón social',  placeholder: 'Mr. Hops Beer SRL' },
      { key: 'afip_punto_venta',   label: 'Punto de venta', placeholder: '1' },
      { key: 'afip_cert',          label: 'Certificado (.crt)', type: 'textarea', sensitive: true,
        placeholder: '-----BEGIN CERTIFICATE-----\n...', hint: 'Certificado generado en ARCA para el servicio wsfe' },
      { key: 'afip_private_key',   label: 'Clave privada (.key)', type: 'textarea', sensitive: true,
        placeholder: '-----BEGIN RSA PRIVATE KEY-----\n...', hint: 'Clave privada correspondiente al certificado' },
    ],
  },
  {
    id: 'mercadopago',
    label: 'MercadoPago',
    badge: 'Pagos online',
    description: 'Credenciales para procesar pagos con tarjeta y efectivo. El access token ya está configurado como secret del Worker; podés actualizarlo acá.',
    requiredKeys: ['mp_access_token', 'mp_public_key'],
    fields: [
      { key: 'mp_environment', label: 'Entorno', type: 'select',
        options: [{ value: 'sandbox', label: 'Sandbox (testing)' }, { value: 'produccion', label: 'Producción' }] },
      { key: 'mp_public_key',       label: 'Public Key',       placeholder: 'APP_USR-...', hint: 'Clave pública — visible en el frontend para el formulario de pago' },
      { key: 'mp_client_id',        label: 'Client ID',        placeholder: '1234567890' },
      { key: 'mp_access_token',     label: 'Access Token',     sensitive: true, placeholder: 'APP_USR-...', hint: 'Token de producción — nunca exponer en el frontend' },
      { key: 'mp_client_secret',    label: 'Client Secret',    sensitive: true, placeholder: 'abc123...' },
      { key: 'mp_webhook_secret',   label: 'Webhook Secret',   sensitive: true, placeholder: 'abc123...', hint: 'Para validar notificaciones de MP' },
    ],
  },
  {
    id: 'galicia',
    label: 'Galicia Más',
    badge: 'Pagos bancarios',
    description: 'Integración con el programa de puntos y pagos de Banco Galicia.',
    requiredKeys: ['galicia_merchant_id', 'galicia_api_key'],
    fields: [
      { key: 'galicia_environment', label: 'Entorno', type: 'select',
        options: [{ value: 'sandbox', label: 'Sandbox (testing)' }, { value: 'produccion', label: 'Producción' }] },
      { key: 'galicia_merchant_id', label: 'Merchant ID',   placeholder: 'MH-001' },
      { key: 'galicia_api_key',     label: 'API Key',       sensitive: true, placeholder: 'gal_...', hint: 'Clave de acceso a la API de Galicia' },
      { key: 'galicia_secret_key',  label: 'Secret Key',    sensitive: true, placeholder: 'gal_secret_...' },
    ],
  },
]

// ── Componentes auxiliares ─────────────────────────────────────────────────────

function StatusBadge({ configured, total }: { configured: number; total: number }) {
  const all = configured === total
  const some = configured > 0
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
      all  ? 'bg-hops-green/15 text-hops-green' :
      some ? 'bg-yellow-500/15 text-yellow-400' :
             'bg-hops-border/50 text-hops-subtle'
    }`}>
      {all ? 'Configurado' : some ? 'Parcial' : 'Sin configurar'}
    </span>
  )
}

function SensitiveInput({
  value, onChange, placeholder, rows,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  const [show, setShow] = useState(false)
  const isSet = value === SENTINEL

  if (rows) {
    return (
      <div className="relative">
        <textarea
          value={isSet ? '' : value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          className="input-field resize-none font-mono text-xs pr-10"
          placeholder={isSet ? '(ya configurado — escribí para reemplazar)' : placeholder}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={isSet ? '' : value}
        onChange={e => onChange(e.target.value)}
        className="input-field pr-10 font-mono text-sm"
        placeholder={isSet ? '(ya configurado — escribí para reemplazar)' : placeholder}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-hops-muted hover:text-hops-white transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

// ── Sección de configuración ───────────────────────────────────────────────────

function SettingSection({
  section, values, onChange, onSave, saving, saved, saveError,
}: {
  section: Section
  values: Record<string, string>
  onChange: (key: string, val: string) => void
  onSave: (sectionId: string) => void
  saving: boolean
  saved: boolean
  saveError: string | null
}) {
  const configuredCount = section.requiredKeys.filter(k => values[k] && values[k] !== '').length

  return (
    <div className="card space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-hops-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-xl uppercase tracking-wider text-hops-white">{section.label}</h2>
            <span className="text-xs text-hops-muted bg-hops-raised px-2 py-0.5 rounded-full">{section.badge}</span>
          </div>
          <p className="text-xs text-hops-muted leading-relaxed max-w-lg">{section.description}</p>
        </div>
        <StatusBadge configured={configuredCount} total={section.requiredKeys.length} />
      </div>

      {/* Campos */}
      {section.fields.map(field => (
        <div key={field.key}>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1.5">
            {field.label}
            {section.requiredKeys.includes(field.key) && <span className="text-hops-error ml-1">*</span>}
          </label>

          {field.type === 'select' ? (
            <select
              value={values[field.key] ?? field.options?.[0]?.value ?? ''}
              onChange={e => onChange(field.key, e.target.value)}
              className="input-field"
            >
              {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : field.sensitive ? (
            <SensitiveInput
              value={values[field.key] ?? ''}
              onChange={v => onChange(field.key, v)}
              placeholder={field.placeholder}
              rows={field.type === 'textarea' ? 5 : undefined}
            />
          ) : field.type === 'textarea' ? (
            <textarea
              value={values[field.key] ?? ''}
              onChange={e => onChange(field.key, e.target.value)}
              rows={5}
              className="input-field resize-none font-mono text-xs"
              placeholder={field.placeholder}
            />
          ) : (
            <input
              type="text"
              value={values[field.key] ?? ''}
              onChange={e => onChange(field.key, e.target.value)}
              className="input-field"
              placeholder={field.placeholder}
            />
          )}

          {field.hint && <p className="mt-1 text-xs text-hops-subtle">{field.hint}</p>}
        </div>
      ))}

      {/* Feedback + Guardar */}
      <div className="flex items-center gap-3 pt-2 border-t border-hops-border">
        <button
          type="button"
          onClick={() => onSave(section.id)}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {saving
            ? <><Loader2 size={14} className="animate-spin" /> Guardando...</>
            : <><Save size={14} /> Guardar {section.label}</>
          }
        </button>

        {saved && !saving && (
          <span className="flex items-center gap-1.5 text-hops-green text-sm">
            <CheckCircle size={14} /> Guardado
          </span>
        )}
        {saveError && (
          <span className="flex items-center gap-1.5 text-hops-error text-sm">
            <AlertCircle size={14} /> {saveError}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [values,  setValues]  = useState<Record<string, string>>({})
  const [sectionState, setSectionState] = useState<Record<string, { saving: boolean; saved: boolean; error: string | null }>>({})

  useEffect(() => {
    api.get<{ data: Record<string, string> }>('/admin/settings')
      .then(r => setValues(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const handleSave = async (sectionId: string) => {
    const section = SECTIONS.find(s => s.id === sectionId)
    if (!section) return

    setSectionState(prev => ({ ...prev, [sectionId]: { saving: true, saved: false, error: null } }))

    const payload: Record<string, string> = {}
    for (const field of section.fields) {
      payload[field.key] = values[field.key] ?? ''
    }

    try {
      await api.put('/admin/settings', payload)
      setSectionState(prev => ({ ...prev, [sectionId]: { saving: false, saved: true, error: null } }))
      setTimeout(() => setSectionState(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], saved: false } })), 3000)
    } catch (err: unknown) {
      setSectionState(prev => ({
        ...prev,
        [sectionId]: { saving: false, saved: false, error: err instanceof Error ? err.message : 'Error al guardar' },
      }))
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="section-title mb-1">Configuración</h1>
        <p className="text-hops-muted text-sm">Credenciales e integraciones externas. Los campos marcados con <span className="text-hops-error">*</span> son obligatorios para activar cada servicio.</p>
      </div>

      {SECTIONS.map(section => {
        const state = sectionState[section.id] ?? { saving: false, saved: false, error: null }
        return (
          <SettingSection
            key={section.id}
            section={section}
            values={values}
            onChange={handleChange}
            onSave={handleSave}
            saving={state.saving}
            saved={state.saved}
            saveError={state.error}
          />
        )
      })}
    </div>
  )
}
