# ClubStore - Plataforma de Tiendas para Clubes Deportivos

Plataforma que permite a clubes deportivos tener su propia tienda online donde venden productos fabricados bajo demanda.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 14 + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes + Supabase Edge Functions
- **Base de Datos:** Supabase PostgreSQL con Row Level Security
- **Pagos:** Stripe Connect
- **Hosting:** Vercel + Supabase Cloud

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Stripe](https://stripe.com)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

## 🛠️ Instalación Local

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd clubes-tienda-platform
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales reales.

### 4. Configurar Supabase

1. Crear un nuevo proyecto en Supabase
2. Ir a SQL Editor y ejecutar el script de migración en `supabase/migrations/`
3. Copiar las credenciales a `.env.local`

### 5. Configurar Stripe

1. Crear cuenta en Stripe
2. Obtener las claves de API desde el Dashboard
3. Configurar Stripe Connect para marketplace
4. Agregar las claves a `.env.local`

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── (tienda)/          # Rutas públicas de tienda
│   ├── (dashboard)/       # Panel de administración de clubes
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout raíz
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn)
│   ├── tienda/           # Componentes de tienda
│   └── dashboard/        # Componentes del panel
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuración
├── services/             # Lógica de negocio
├── types/                # TypeScript types
└── public/               # Assets estáticos
```

## 🔐 Autenticación

- Clubes se autentican con email/password vía Supabase Auth
- Compradores pueden comprar como invitados o crear cuenta
- Row Level Security protege los datos por club

## 💳 Flujo de Pagos

1. Cliente agrega productos al carrito
2. Checkout crea sesión de Stripe
3. Pago se procesa via Stripe Checkout
4. Webhook confirma el pago
5. Comisión se retiene, resto va al club via Stripe Connect

## 🚀 Deploy en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel Dashboard
3. Deploy automático en cada push a main

```bash
vercel --prod
```

## 📝 Licencia

Propietario - Todos los derechos reservados
