#!/usr/bin/env bash
# deploy.sh — Deploy completo de Mr. Hops Beer a Cloudflare
# Uso: bash deploy.sh
set -e

NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Mr. Hops Beer — Deploy Cloudflare  ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ─── 1. D1: crear base de datos ───────────────────────────────────────────────
echo "▶ [1/7] Creando base de datos D1..."
cd api
DB_OUTPUT=$(npx wrangler d1 create mr-hops-db 2>&1 || true)
if echo "$DB_OUTPUT" | grep -q "database_id"; then
  DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | sed 's/.*database_id = "\(.*\)"/\1/')
  echo "   ✓ D1 creada: $DB_ID"
  sed -i "s/REEMPLAZAR_CON_TU_D1_DATABASE_ID/$DB_ID/g" wrangler.toml
elif echo "$DB_OUTPUT" | grep -q "already exists"; then
  echo "   ℹ D1 ya existe — obteniendo ID..."
  DB_ID=$(npx wrangler d1 list 2>&1 | grep "mr-hops-db" | awk '{print $NF}')
  if [ -n "$DB_ID" ]; then
    sed -i "s/REEMPLAZAR_CON_TU_D1_DATABASE_ID/$DB_ID/g" wrangler.toml
    echo "   ✓ D1 ID: $DB_ID"
  fi
else
  echo "   ⚠ No se pudo obtener el ID de D1. Actualizá wrangler.toml manualmente."
fi

# ─── 2. D1: aplicar migración ─────────────────────────────────────────────────
echo ""
echo "▶ [2/7] Aplicando migración D1 en producción..."
npx wrangler d1 execute mr-hops-db --remote --file=src/db/migrations/0001_init.sql
echo "   ✓ Migración aplicada"

# ─── 3. R2: crear bucket ──────────────────────────────────────────────────────
echo ""
echo "▶ [3/7] Creando bucket R2..."
npx wrangler r2 bucket create mr-hops-images 2>&1 | grep -v "^$" || true
echo "   ✓ Bucket mr-hops-images listo"

# ─── 4. Secrets ───────────────────────────────────────────────────────────────
echo ""
echo "▶ [4/7] Configurando secrets..."
echo "   Ingresá los valores cuando se pidan:"
echo ""
echo "   JWT_SECRET (generá uno largo y aleatorio):"
npx wrangler secret put JWT_SECRET
echo "   RESEND_API_KEY (de resend.com):"
npx wrangler secret put RESEND_API_KEY
echo "   ADMIN_EMAIL (tu email de admin):"
npx wrangler secret put ADMIN_EMAIL
echo "   ✓ Secrets configurados"

# ─── 5. Deploy API (Worker) ───────────────────────────────────────────────────
echo ""
echo "▶ [5/7] Deployando API a Cloudflare Workers..."
npx wrangler deploy
WORKER_URL=$(npx wrangler deploy --dry-run 2>&1 | grep "workers.dev" | head -1 | awk '{print $NF}' || echo "https://mr-hops-api.TU_SUBDOMINIO.workers.dev")
echo "   ✓ API deployada"

# ─── 6. Build y deploy Frontend (Pages) ──────────────────────────────────────
echo ""
echo "▶ [6/7] Build y deploy del frontend a Cloudflare Pages..."
cd ../frontend
npm run build
npx wrangler pages deploy dist --project-name mr-hops-beer
echo "   ✓ Frontend deployado"

# ─── 7. Resumen ───────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Deploy completado                                   ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║   Frontend:  https://mr-hops-beer.pages.dev          ║"
echo "║   API:       https://mr-hops-api.TU_SUBDOMINIO.workers.dev ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║   Próximos pasos:                                    ║"
echo "║   1. Actualizar FRONTEND_URL en api/wrangler.toml   ║"
echo "║   2. Actualizar VITE_API_URL en el build de Pages   ║"
echo "║   3. Habilitar R2 public access y actualizar        ║"
echo "║      R2_PUBLIC_URL en api/wrangler.toml             ║"
echo "║   4. Configurar Cloudflare Access para /admin/*     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
