# IdeaForge - Plataforma de Tiendas para Clubes Deportivos

Plataforma que permite a clubes deportivos tener su propia tienda online donde venden productos fabricados bajo demanda.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 14 + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes + Supabase Edge Functions
- **Base de Datos:** Supabase PostgreSQL con Row Level Security
- **Pagos:** Stripe Connect
- **Hosting:** Vercel + Supabase Cloud

## 📋 Requisitos Previos

- Node.js 18.17 o superior
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Stripe](https://stripe.com)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

## 🛠️ Instalación Local

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd ideaforge-clubes-deportivos
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

- **Supabase:** Obtén las claves en Settings > API de tu proyecto
- **Stripe:** Obtén las claves en Developers > API Keys

### 4. Configurar la base de datos

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de clubes
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  logo_url TEXT,
  color_primario TEXT DEFAULT '#1a1a1a',
  color_secundario TEXT DEFAULT '#ffffff',
  stripe_account_id TEXT,
  comision_porcentaje DECIMAL(5,2) DEFAULT 15.00,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios de club
CREATE TABLE usuarios_club (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rol TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, auth_user_id)
);

-- Tabla de productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_base DECIMAL(10,2) NOT NULL,
  costo_produccion DECIMAL(10,2) NOT NULL,
  categoria TEXT,
  imagenes JSONB DEFAULT '[]',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de variantes de producto
CREATE TABLE variantes_producto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  talla TEXT,
  color TEXT,
  sku TEXT,
  activo BOOLEAN DEFAULT true
);

-- Tabla de pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id),
  numero_pedido TEXT UNIQUE NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  cliente_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  direccion_envio JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  costo_envio DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  comision_plataforma DECIMAL(10,2),
  pago_club DECIMAL(10,2),
  stripe_payment_intent_id TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ
);

-- Tabla de items de pedido
CREATE TABLE items_pedido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  variante_id UUID REFERENCES variantes_producto(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Índices
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_productos_club ON productos(club_id);
CREATE INDEX idx_pedidos_club ON pedidos(club_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);

-- Row Level Security
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_club ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variantes_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para tiendas
CREATE POLICY "Clubs activos son públicos" ON clubs
  FOR SELECT USING (activo = true);

CREATE POLICY "Productos activos son públicos" ON productos
  FOR SELECT USING (activo = true);

CREATE POLICY "Variantes activas son públicas" ON variantes_producto
  FOR SELECT USING (activo = true);

-- Políticas para usuarios autenticados de clubs
CREATE POLICY "Usuarios pueden ver su club" ON clubs
  FOR ALL USING (
    id IN (SELECT club_id FROM usuarios_club WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Usuarios pueden gestionar productos de su club" ON productos
  FOR ALL USING (
    club_id IN (SELECT club_id FROM usuarios_club WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Usuarios pueden ver pedidos de su club" ON pedidos
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM usuarios_club WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Usuarios pueden actualizar pedidos de su club" ON pedidos
  FOR UPDATE USING (
    club_id IN (SELECT club_id FROM usuarios_club WHERE auth_user_id = auth.uid())
  );

-- Función para generar número de pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero_pedido := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();
```

### 5. Configurar Stripe Connect

1. Habilita Stripe Connect en tu dashboard de Stripe
2. Configura el webhook apuntando a `/api/webhooks/stripe`
3. Selecciona los eventos: `checkout.session.completed`, `payment_intent.succeeded`

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Visita `http://localhost:3000`

## 📁 Estructura del Proyecto

```
├── app/
│   ├── (tienda)/           # Rutas públicas de tiendas
│   │   └── [slug]/         # Tienda dinámica por club
│   ├── (dashboard)/        # Panel de administración
│   │   └── club/           # Dashboard del club
│   ├── api/                # API Routes
│   ├── globals.css         # Estilos globales
│   └── layout.tsx          # Layout raíz
├── components/
│   ├── tienda/             # Componentes de tienda
│   ├── dashboard/          # Componentes de dashboard
│   └── ui/                 # Componentes shadcn/ui
├── hooks/                  # Custom hooks
├── lib/                    # Utilidades y configuración
├── services/               # Lógica de negocio
└── types/                  # Tipos TypeScript
```

## 🚀 Deploy en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Deploy automático en cada push a main

```bash
vercel --prod
```

## 🔒 Seguridad

- Row Level Security habilitado en todas las tablas
- Validación de datos con Zod
- Autenticación con Supabase Auth
- Webhooks de Stripe verificados con firma

## 📝 Licencia

MIT License
