# Mr. Hops Beer 🍺

Tienda web para la cervecería artesanal **Mr. Hops Beer**. Venta de latas, PETs, packs, y alquiler de barriles.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| API | Cloudflare Workers + Hono + TypeScript |
| Base de datos | Cloudflare D1 (SQLite) |
| Imágenes | Cloudflare R2 |
| Auth admin | Cloudflare Access |
| Deploy | Cloudflare Pages (frontend) + Workers (API) |
| Emails | Resend |

## Estructura del monorepo

```
mr-hops-beer/
├── frontend/   # React app → Cloudflare Pages
└── api/        # Hono Workers → Cloudflare Workers
```

## Desarrollo local

### Requisitos
- Node.js 20+
- Cuenta en Cloudflare (para D1, R2 y Workers)

### Instalación

```bash
# Frontend
cd frontend && npm install

# API
cd ../api && npm install
cp .dev.vars.example .dev.vars
# Editar .dev.vars con JWT_SECRET, RESEND_API_KEY y ADMIN_EMAIL
```

### Base de datos local

```bash
cd api

# Crear la base de datos (solo la primera vez)
npx wrangler d1 create mr-hops-db

# Copiar el database_id al wrangler.toml

# Aplicar migración
npx wrangler d1 migrations apply mr-hops-db --local
```

### Correr en local

```bash
# Terminal 1 — API en :8787
cd api && npm run dev

# Terminal 2 — Frontend en :5173
cd frontend && npm run dev
```

### Variables de entorno para el frontend

Crear `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5173/api
VITE_WHATSAPP_NUMBER=5491100000000
```

## Deploy

### API (Cloudflare Workers)

```bash
cd api

# Configurar secrets en Cloudflare
npx wrangler secret put JWT_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ADMIN_EMAIL

# Aplicar migración en producción
npx wrangler d1 migrations apply mr-hops-db

# Deploy
npm run deploy
```

### Frontend (Cloudflare Pages)

```bash
cd frontend && npm run build
# El deploy lo hace GitHub Actions automáticamente al pushear a main
```

### Secrets en GitHub

Agregar en Settings → Secrets → Actions:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_API_URL`
- `VITE_WHATSAPP_NUMBER`

## Estado del proyecto

| Etapa | Estado |
|---|---|
| Etapa 1 — Scaffolding, configs, DB schema | ✅ |
| Etapa 2 — API: auth, productos, barriles | ✅ |
| Etapa 3 — API: orders, reservas, admin, R2 | ✅ |
| Etapa 4 — Frontend: router, layout, age gate, stores | ✅ |
| Etapa 5 — Frontend: páginas públicas | ✅ |
| Etapa 6 — Frontend: panel admin | 🚧 En progreso |

## Leyenda legal

> **BEBER CON MODERACIÓN. PROHIBIDA LA VENTA A MENORES DE 18 AÑOS.**
