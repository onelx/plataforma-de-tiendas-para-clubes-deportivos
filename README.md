# ClubStore Platform

Plataforma de tiendas online para clubes deportivos con productos fabricados bajo demanda.

## Stack Tecnológico

- **Frontend**: Next.js 14 con App Router
- **UI**: Tailwind CSS + shadcn/ui
- **Base de Datos**: Supabase PostgreSQL
- **Autenticación**: Supabase Auth
- **Pagos**: Stripe Connect + Stripe Checkout
- **Hosting**: Vercel + Supabase Cloud

## Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (gratuita)
- Cuenta de Stripe (modo test gratuito)
- npm o yarn

## Configuración Inicial

### 1. Clonar e Instalar

```bash
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en [Supabase](https://app.supabase.com)
2. Copiar `.env.example` a `.env.local`
3. Obtener credenciales desde Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Crear Esquema de Base de Datos

Ejecutar el siguiente SQL en Supabase SQL Editor:

```sql
-- Tabla de clubs
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    logo_url TEXT,
    color_primario TEXT DEFAULT '#000000',
    color_secundario TEXT DEFAULT '#FFFFFF',
    stripe_account_id TEXT,
    comision_porcentaje DECIMAL(5,2) DEFAULT 15.00,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios de club
CREATE TABLE usuarios_club (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rol TEXT NOT NULL CHECK (rol IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, auth_user_id)
);

-- Tabla de productos
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL,
    costo_produccion DECIMAL(10,2) NOT NULL,
    categoria TEXT,
    imagenes JSONB DEFAULT '[]'::jsonb,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de variantes de producto
CREATE TABLE variantes_producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    talla TEXT,
    color TEXT,
    sku TEXT UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- Tabla de pedidos
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    numero_pedido TEXT UNIQUE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'produccion', 'enviado', 'entregado', 'cancelado')),
    cliente_email TEXT NOT NULL,
    cliente_nombre TEXT NOT NULL,
    direccion_envio JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    costo_envio DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    comision_plataforma DECIMAL(10,2) NOT NULL,
    pago_club DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id TEXT,
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ
);

-- Tabla de items de pedido
CREATE TABLE items_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE RESTRICT,
    variante_id UUID REFERENCES variantes_producto(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Índices para optimización
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_productos_club ON productos(club_id);
CREATE INDEX idx_pedidos_club ON pedidos(club_id);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_items_pedido ON items_pedido(pedido_id);

-- Row Level Security
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_club ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variantes_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clubs (lectura pública)
CREATE POLICY "Clubs son públicos" ON clubs FOR SELECT USING (activo = true);

-- Políticas RLS para productos (lectura pública)
CREATE POLICY "Productos son públicos" ON productos FOR SELECT USING (activo = true);
CREATE POLICY "Variantes son públicas" ON variantes_producto FOR SELECT USING (activo = true);

-- Políticas RLS para usuarios_club
CREATE POLICY "Usuarios pueden ver su club" ON usuarios_club FOR SELECT USING (auth.uid() = auth_user_id);

-- Políticas RLS para gestión de productos (solo admins del club)
CREATE POLICY "Admins pueden gestionar productos" ON productos 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios_club 
            WHERE usuarios_club.club_id = productos.club_id 
            AND usuarios_club.auth_user_id = auth.uid()
            AND usuarios_club.rol IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins pueden gestionar variantes" ON variantes_producto 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM productos 
            JOIN usuarios_club ON usuarios_club.club_id = productos.club_id
            WHERE productos.id = variantes_producto.producto_id
            AND usuarios_club.auth_user_id = auth.uid()
            AND usuarios_club.rol IN ('admin', 'editor')
        )
    );

-- Políticas RLS para pedidos
CREATE POLICY "Admins pueden ver pedidos de su club" ON pedidos 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_club 
            WHERE usuarios_club.club_id = pedidos.club_id 
            AND usuarios_club.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Admins pueden actualizar estado de pedidos" ON pedidos 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios_club 
            WHERE usuarios_club.club_id = pedidos.club_id 
            AND usuarios_club.auth_user_id = auth.uid()
            AND usuarios_club.rol IN ('admin', 'editor')
        )
    );

CREATE POLICY "Items de pedido son visibles para admins del club" ON items_pedido 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pedidos 
            JOIN usuarios_club ON usuarios_club.club_id = pedidos.club_id
            WHERE pedidos.id = items_pedido.pedido_id
            AND usuarios_club.auth_user_id = auth.uid()
        )
    );

-- Función para generar número de pedido
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TEXT AS $$
DECLARE
    nuevo_numero TEXT;
BEGIN
    nuevo_numero := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN nuevo_numero;
END;
$$ LANGUAGE plpgsql;
```

### 4. Configurar Stripe

1. Crear cuenta en [Stripe](https://dashboard.stripe.com)
2. Obtener API keys desde Developers → API keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
3. Configurar webhook para eventos de pago:
   - URL: `https://tu-dominio.vercel.app/api/webhooks/stripe`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copiar signing secret a `STRIPE_WEBHOOK_SECRET`

### 5. Datos de Prueba (Opcional)

```sql
-- Insertar club de ejemplo
INSERT INTO clubs (slug, nombre, logo_url, color_primario, color_secundario)
VALUES ('club-atletico', 'Club Atlético Demo', 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12', '#0066cc', '#ffffff');

-- Insertar producto de ejemplo
INSERT INTO productos (club_id, nombre, descripcion, precio_base, costo_produccion, categoria, imagenes)
SELECT 
    id,
    'Camiseta Oficial 2024',
    'Camiseta oficial del club con tecnología Dri-FIT',
    5999.00,
    2000.00,
    'Indumentaria',
    '[{"url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", "alt": "Camiseta frente"}]'::jsonb
FROM clubs WHERE slug = 'club-atletico';

-- Insertar variantes
INSERT INTO variantes_producto (producto_id, talla, color, sku)
SELECT 
    id,
    t.talla,
    c.color,
    'CAM-' || t.talla || '-' || UPPER(LEFT(c.color, 3))
FROM productos p
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL')) AS t(talla)
CROSS JOIN (VALUES ('Rojo'), ('Azul'), ('Blanco')) AS c(color)
WHERE p.nombre = 'Camiseta Oficial 2024';
```

## Desarrollo

```bash
# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
clubstore-platform/
├── app/                    # Next.js App Router
│   ├── (tienda)/          # Rutas públicas de tienda
│   ├── dashboard/         # Panel de administración
│   ├── api/               # API Routes
│   ├── layout.tsx         # Layout raíz
│   └── globals.css        # Estilos globales
├── components/            # Componentes React reutilizables
│   ├── ui/               # Componentes base de shadcn/ui
│   └── ...               # Componentes de dominio
├── hooks/                # Custom React hooks
├── lib/                  # Utilidades y configuración
│   ├── supabase.ts      # Cliente Supabase
│   └── utils.ts         # Funciones helper
├── services/            # Lógica de negocio y API calls
├── types/               # Definiciones TypeScript
└── public/              # Assets estáticos
```

## Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno desde `.env.example`
3. Deploy automático en cada push a main

### Configuración Post-Despliegue

1. Actualizar `NEXT_PUBLIC_APP_URL` con la URL de producción
2. Actualizar webhook de Stripe con la URL de producción
3. Configurar dominios personalizados en Vercel (opcional)

## Variables de Entorno Requeridas

Ver `.env.example` para lista completa con descripciones.

## Soporte

Para issues o preguntas, abrir un ticket en el repositorio.

## Licencia

Propietario - Todos los derechos reservados
