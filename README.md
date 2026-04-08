# Plataforma de Tiendas para Clubes Deportivos

Sistema completo para que clubes deportivos gestionen sus propias tiendas online con productos fabricados bajo demanda.

## Stack Tecnológico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Base de Datos**: Supabase PostgreSQL con Row Level Security
- **Pagos**: Stripe + Stripe Connect
- **Hosting**: Vercel + Supabase Cloud

## Características

### Para Clubes (B2B)
- Panel de administración completo
- Gestión de productos con variantes (tallas, colores)
- Seguimiento de pedidos en tiempo real
- Estadísticas de ventas y comisiones
- Configuración de branding (colores, logo)
- Integración con Stripe Connect

### Para Socios (B2C)
- Tienda personalizada por club
- Carrito de compras persistente
- Checkout con Stripe
- Seguimiento de pedidos
- Múltiples opciones de pago

## Setup Inicial

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd club-stores-platform
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copiá `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Completá las variables de entorno con tus credenciales:

- **Supabase**: Creá un proyecto en [supabase.com](https://supabase.com)
- **Stripe**: Obtené las claves desde [dashboard.stripe.com](https://dashboard.stripe.com)

### 4. Configurar Base de Datos

Ejecutá el siguiente SQL en tu proyecto de Supabase (SQL Editor):

```sql
-- Tabla de clubes
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  logo_url TEXT,
  color_primario TEXT DEFAULT '#000000',
  color_secundario TEXT DEFAULT '#FFFFFF',
  stripe_account_id TEXT,
  comision_porcentaje DECIMAL(5,4) DEFAULT 0.15,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de usuarios del club
CREATE TABLE usuarios_club (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rol TEXT CHECK (rol IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT now(),
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de variantes de producto
CREATE TABLE variantes_producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  talla TEXT,
  color TEXT,
  sku TEXT UNIQUE,
  activo BOOLEAN DEFAULT true
);

-- Tabla de pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  numero_pedido TEXT UNIQUE NOT NULL,
  estado TEXT CHECK (estado IN ('pendiente', 'pagado', 'produccion', 'enviado', 'entregado', 'cancelado')) DEFAULT 'pendiente',
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
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ
);

-- Tabla de items de pedido
CREATE TABLE items_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  variante_id UUID REFERENCES variantes_producto(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Índices para mejor performance
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_productos_club ON productos(club_id);
CREATE INDEX idx_pedidos_club ON pedidos(club_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_items_pedido ON items_pedido(pedido_id);

-- Row Level Security
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_club ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variantes_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (ejemplos básicos)
CREATE POLICY "Clubs son públicos" ON clubs FOR SELECT USING (activo = true);
CREATE POLICY "Productos activos son públicos" ON productos FOR SELECT USING (activo = true);
CREATE POLICY "Variantes activas son públicas" ON variantes_producto FOR SELECT USING (activo = true);

-- Función para generar número de pedido
CREATE OR REPLACE FUNCTION generate_numero_pedido()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || LPAD(nextval('pedidos_seq')::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS pedidos_seq START 1000;
```

### 5. Configurar Stripe Connect

1. Activá Stripe Connect en tu cuenta de Stripe
2. Configurá el flujo de OAuth para clubes
3. Agregá el webhook endpoint: `https://tu-dominio.com/api/webhooks/stripe`
4. Eventos a escuchar: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 6. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
├── app/
│   ├── (tienda)/              # Rutas públicas de tienda
│   │   └── [slug]/            # Tienda específica del club
│   ├── (dashboard)/           # Panel de administración
│   │   └── club/
│   ├── api/                   # API Routes
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                    # Componentes de shadcn/ui
│   ├── tienda/                # Componentes de tienda
│   └── dashboard/             # Componentes del panel
├── lib/
│   ├── supabase.ts            # Cliente de Supabase
│   ├── stripe.ts              # Cliente de Stripe
│   └── utils.ts               # Utilidades
├── services/                  # Lógica de negocio
│   ├── pedidos.service.ts
│   ├── productos.service.ts
│   └── pagos.service.ts
├── hooks/                     # Custom hooks
│   ├── useCart.ts
│   ├── useClub.ts
│   └── useAuth.ts
└── types/
    └── index.ts               # Tipos TypeScript
```

## Deploy en Vercel

1. Push del código a GitHub
2. Importá el proyecto en [Vercel](https://vercel.com)
3. Configurá las variables de entorno
4. Deploy automático

## Deploy de Base de Datos

Supabase se configura automáticamente. Solo asegurate de:
- Ejecutar las migraciones SQL
- Configurar las políticas RLS correctamente
- Habilitar realtime si es necesario

## Variables de Entorno en Producción

Asegurate de configurar TODAS las variables de `.env.example` en tu entorno de producción (Vercel):

- Supabase URL y keys
- Stripe keys y webhook secret
- URL base de la aplicación
- Configuración de comisiones

## Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Autenticación con Supabase Auth
- ✅ Validación de datos con Zod
- ✅ Sanitización de inputs
- ✅ HTTPS obligatorio en producción
- ✅ Webhooks firmados con Stripe

## Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## Soporte

Para problemas o consultas, contactá a soporte@plataforma.com

## Licencia

Propietario - Todos los derechos reservados
