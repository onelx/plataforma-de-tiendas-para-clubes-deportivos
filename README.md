# ClubStore Platform

Plataforma de tiendas online para clubes deportivos con fabricación bajo demanda.

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL con Row Level Security
- **Autenticación**: Supabase Auth
- **Pagos**: Stripe Connect
- **Hosting**: Vercel + Supabase Cloud

## Características Principales

### Para Clubes (B2B)
- Panel de administración completo
- Gestión de productos con variantes (tallas/colores)
- Seguimiento de pedidos en tiempo real
- Estadísticas de ventas y comisiones
- Personalización de branding (logo, colores)

### Para Socios (B2C)
- Tienda online personalizada por club
- Carrito de compras con persistencia
- Checkout seguro con Stripe
- Seguimiento de pedidos
- Variantes de producto (talla/color)

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Stripe

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd clubstore-platform
npm install
```

### 2. Configurar Supabase

1. Crear un nuevo proyecto en [Supabase](https://app.supabase.com)
2. Ejecutar las migraciones SQL (ver sección Database Schema)
3. Configurar Row Level Security policies
4. Obtener las API keys del proyecto

### 3. Configurar Stripe

1. Crear cuenta en [Stripe](https://dashboard.stripe.com)
2. Activar Stripe Connect para pagos a clubes
3. Configurar webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Eventos del webhook: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Obtener las API keys y webhook secret

### 4. Variables de Entorno

Copiar `.env.example` a `.env.local` y completar con tus valores:

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales reales.

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Database Schema

Ejecutar estos comandos SQL en el SQL Editor de Supabase:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clubs table
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  logo_url TEXT,
  color_primario TEXT DEFAULT '#000000',
  color_secundario TEXT DEFAULT '#ffffff',
  stripe_account_id TEXT,
  comision_porcentaje DECIMAL(5,2) DEFAULT 15.00,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club users table
CREATE TABLE usuarios_club (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rol TEXT CHECK (rol IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, auth_user_id)
);

-- Products table
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Product variants table
CREATE TABLE variantes_producto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  talla TEXT,
  color TEXT,
  sku TEXT UNIQUE,
  activo BOOLEAN DEFAULT true,
  UNIQUE(producto_id, talla, color)
);

-- Orders table
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  numero_pedido TEXT UNIQUE NOT NULL,
  estado TEXT CHECK (estado IN ('pending', 'paid', 'production', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  cliente_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  direccion_envio JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  costo_envio DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  comision_plataforma DECIMAL(10,2) NOT NULL,
  pago_club DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ
);

-- Order items table
CREATE TABLE items_pedido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  variante_id UUID REFERENCES variantes_producto(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_productos_club ON productos(club_id);
CREATE INDEX idx_pedidos_club ON pedidos(club_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);

-- Row Level Security Policies

-- Clubs: public read, authenticated write for own club
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clubs are viewable by everyone" 
  ON clubs FOR SELECT 
  USING (activo = true);

CREATE POLICY "Club users can update their club" 
  ON clubs FOR UPDATE 
  USING (
    id IN (
      SELECT club_id FROM usuarios_club 
      WHERE auth_user_id = auth.uid() AND rol IN ('admin')
    )
  );

-- Productos: public read if active, club users can manage
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are viewable by everyone" 
  ON productos FOR SELECT 
  USING (activo = true);

CREATE POLICY "Club users can manage their products" 
  ON productos FOR ALL 
  USING (
    club_id IN (
      SELECT club_id FROM usuarios_club 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Variantes: public read if active, club users can manage
ALTER TABLE variantes_producto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active variants are viewable by everyone" 
  ON variantes_producto FOR SELECT 
  USING (
    activo = true AND 
    producto_id IN (SELECT id FROM productos WHERE activo = true)
  );

CREATE POLICY "Club users can manage their variants" 
  ON variantes_producto FOR ALL 
  USING (
    producto_id IN (
      SELECT p.id FROM productos p
      INNER JOIN usuarios_club uc ON p.club_id = uc.club_id
      WHERE uc.auth_user_id = auth.uid()
    )
  );

-- Pedidos: club users can view their orders
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club users can view their orders" 
  ON pedidos FOR SELECT 
  USING (
    club_id IN (
      SELECT club_id FROM usuarios_club 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Club users can update their orders" 
  ON pedidos FOR UPDATE 
  USING (
    club_id IN (
      SELECT club_id FROM usuarios_club 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Items pedido: viewable by club users
ALTER TABLE items_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club users can view order items" 
  ON items_pedido FOR SELECT 
  USING (
    pedido_id IN (
      SELECT p.id FROM pedidos p
      INNER JOIN usuarios_club uc ON p.club_id = uc.club_id
      WHERE uc.auth_user_id = auth.uid()
    )
  );
```

## Estructura del Proyecto

```
clubstore-platform/
├── app/
│   ├── (tienda)/          # Rutas públicas de tienda
│   ├── dashboard/         # Panel de administración
│   ├── api/              # API Routes
│   ├── globals.css       # Estilos globales
│   └── layout.tsx        # Layout raíz
├── components/           # Componentes React
├── lib/                 # Utilidades y configuración
├── services/            # Lógica de negocio
├── hooks/              # Custom React hooks
└── types/              # TypeScript types
```

## Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno en Vercel Dashboard
3. Deploy automático en cada push a main

### Variables de Entorno en Producción

Asegurar que todas las variables de `.env.example` estén configuradas en Vercel con valores de producción.

## Webhooks de Stripe

Configurar endpoint de webhook en Stripe Dashboard:
- URL: `https://your-domain.com/api/webhooks/stripe`
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Soporte

Para issues y preguntas, abrir un issue en GitHub.

## Licencia

MIT
