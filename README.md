# Plataforma de Tiendas para Clubes Deportivos

Plataforma B2B2C que permite a clubes deportivos tener su propia tienda online personalizada donde venden productos fabricados bajo demanda.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Base de Datos**: Supabase PostgreSQL con Row Level Security
- **Autenticación**: Supabase Auth
- **Pagos**: Stripe Connect (para split payments entre plataforma y clubes)
- **Hosting**: Vercel (frontend) + Supabase Cloud (backend/DB)

## 📁 Estructura del Proyecto

```
├── app/                    # Next.js App Router
│   ├── (tienda)/          # Rutas públicas de tiendas
│   │   └── [slug]/        # Tienda de cada club
│   ├── (dashboard)/       # Panel de administración de clubes
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout raíz
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── tienda/           # Componentes de la tienda
│   └── dashboard/        # Componentes del panel
├── hooks/                 # Custom React hooks
├── lib/                   # Utilidades y configuraciones
├── services/             # Lógica de negocio y acceso a datos
├── types/                # TypeScript types
└── public/               # Assets estáticos
```

## 🛠️ Instalación

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- Cuenta en Supabase
- Cuenta en Stripe

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd clubes-tienda-platform
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   Editar `.env.local` con tus credenciales.

4. **Configurar Supabase**
   
   - Crear un nuevo proyecto en [supabase.com](https://supabase.com)
   - Ejecutar las migraciones SQL (ver sección Database Setup)
   - Configurar las políticas RLS

5. **Configurar Stripe**
   
   - Crear cuenta en [stripe.com](https://stripe.com)
   - Habilitar Stripe Connect
   - Configurar webhook endpoint: `https://tu-dominio.com/api/webhooks/stripe`

6. **Iniciar en desarrollo**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

Ejecutar en el SQL Editor de Supabase:

```sql
-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de clubes
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  sku TEXT UNIQUE,
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
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);

-- RLS Policies
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_club ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variantes_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_pedido ENABLE ROW LEVEL SECURITY;

-- Política: Clubs públicos activos son visibles para todos
CREATE POLICY "Clubs activos son públicos" ON clubs
  FOR SELECT USING (activo = true);

-- Política: Usuarios pueden ver/editar su propio club
CREATE POLICY "Usuarios pueden gestionar su club" ON clubs
  FOR ALL USING (
    id IN (
      SELECT club_id FROM usuarios_club 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Política: Productos activos de clubs activos son públicos
CREATE POLICY "Productos activos son públicos" ON productos
  FOR SELECT USING (
    activo = true AND 
    club_id IN (SELECT id FROM clubs WHERE activo = true)
  );

-- Política: Usuarios pueden gestionar productos de su club
CREATE POLICY "Usuarios pueden gestionar productos de su club" ON productos
  FOR ALL USING (
    club_id IN (
      SELECT club_id FROM usuarios_club 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Política: Variantes siguen a sus productos
CREATE POLICY "Variantes públicas" ON variantes_producto
  FOR SELECT USING (
    producto_id IN (
      SELECT id FROM productos WHERE activo = true
    )
  );

-- Política: Usuarios pueden ver pedidos de su club
CREATE POLICY "Usuarios pueden ver pedidos de su club" ON pedidos
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM usuarios_club 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Política: Cualquiera puede crear pedidos
CREATE POLICY "Cualquiera puede crear pedidos" ON pedidos
  FOR INSERT WITH CHECK (true);

-- Política: Items de pedido son visibles con el pedido
CREATE POLICY "Items visibles con pedido" ON items_pedido
  FOR SELECT USING (
    pedido_id IN (SELECT id FROM pedidos)
  );
```

## 🌐 Despliegue

### Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push a main

### Stripe Webhook

Configurar el endpoint en Stripe Dashboard:
- URL: `https://tu-dominio.com/api/webhooks/stripe`
- Eventos: `checkout.session.completed`, `payment_intent.succeeded`

## 📱 Flujos Principales

### Tienda (Cliente Final)
1. Accede a `/{slug-club}` → Ve tienda personalizada
2. Navega productos → Agrega al carrito
3. Checkout → Pago con Stripe
4. Recibe confirmación → Seguimiento de pedido

### Dashboard (Club)
1. Login → Panel de administración
2. Gestiona productos y variantes
3. Ve pedidos y estadísticas
4. Configura branding de la tienda

## 🔧 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # Linter
npm run db:types   # Generar tipos de Supabase
```

## 📄 Licencia

MIT
