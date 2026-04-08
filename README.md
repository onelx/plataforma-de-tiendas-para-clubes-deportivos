# ClubStore Platform

Plataforma de tiendas online para clubes deportivos con fabricación bajo demanda.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Payments:** Stripe + Stripe Connect
- **Deployment:** Vercel + Supabase Cloud

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (gratuita)
- Cuenta de Stripe (modo test)
- Git

## 🛠️ Setup Local

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd clubstore-platform
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crear un proyecto en [Supabase](https://app.supabase.com)
2. Ir a **Settings > API** y copiar:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

3. Ejecutar las migraciones de base de datos:
   - Ir a **SQL Editor** en Supabase
   - Ejecutar el script `supabase/migrations/001_initial_schema.sql`

### 4. Configurar Stripe

1. Crear cuenta en [Stripe](https://dashboard.stripe.com)
2. Activar modo **Test**
3. Ir a **Developers > API keys** y copiar:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

4. Configurar Stripe Connect:
   - Ir a **Connect > Settings**
   - Copiar Client ID → `STRIPE_CONNECT_CLIENT_ID`

5. Configurar Webhooks:
   - Ir a **Developers > Webhooks**
   - Añadir endpoint: `https://tu-dominio.com/api/webhooks/stripe`
   - Seleccionar eventos: `checkout.session.completed`, `payment_intent.succeeded`
   - Copiar Signing secret → `STRIPE_WEBHOOK_SECRET`

### 5. Variables de Entorno

Copiar el archivo de ejemplo y completar con tus credenciales:

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus valores reales.

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🗄️ Estructura de Base de Datos

El proyecto usa las siguientes tablas principales:

- **clubs** - Información de clubes (nombre, logo, colores, comisión)
- **usuarios_club** - Usuarios administradores de cada club
- **productos** - Catálogo de productos por club
- **variantes_producto** - Variantes (tallas/colores) de productos
- **pedidos** - Pedidos realizados
- **items_pedido** - Items individuales de cada pedido

Ver esquema completo en `supabase/migrations/001_initial_schema.sql`

## 🔐 Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas que:

- Permiten lectura pública de clubs y productos activos
- Restringen escritura a usuarios autenticados del club correspondiente
- Protegen datos sensibles (IDs de Stripe, comisiones)

## 📱 Funcionalidades Principales

### Para Clubes (B2B)

- Dashboard con métricas de ventas
- Gestión de productos con variantes
- Seguimiento de pedidos en tiempo real
- Configuración de branding (logo, colores)
- Reportes de comisiones y pagos

### Para Socios (B2C)

- Catálogo de productos del club
- Carrito de compras persistente
- Checkout con Stripe
- Seguimiento de pedido con timeline visual
- Múltiples métodos de pago

## 🚢 Despliegue a Producción

### Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel dashboard
3. Deploy automático en cada push a `main`

### Supabase

1. El proyecto Supabase ya está en la nube
2. Actualizar URLs en `.env` de desarrollo a producción
3. Configurar dominio personalizado (opcional)

### Stripe

1. Cambiar de modo Test a Live
2. Actualizar API keys en variables de entorno
3. Configurar webhook con URL de producción

## 🧪 Testing Webhooks Localmente

Para probar webhooks de Stripe en local:

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 📚 Recursos Adicionales

- [Documentación de Next.js 14](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Stripe Connect](https://stripe.com/docs/connect)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 Soporte

Para issues o preguntas, crear un issue en GitHub o contactar a soporte@clubstore.com

## 📄 Licencia

Proprietary - Todos los derechos reservados
