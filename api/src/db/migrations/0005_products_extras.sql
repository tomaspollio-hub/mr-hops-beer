-- SKU y precio de comparación para descuentos
ALTER TABLE products ADD COLUMN sku TEXT;
ALTER TABLE products ADD COLUMN compare_price REAL;

-- Índice único para SKU cuando se use
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products (sku) WHERE sku IS NOT NULL;
