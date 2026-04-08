# ClubShop Platform

Plataforma de tiendas online para clubes deportivos con productos bajo demanda.

## Stack Tecnológico

- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Base de Datos**: Supabase PostgreSQL con Row Level Security
- **Pagos**: Stripe Connect
- **Hosting**: Vercel + Supabase Cloud

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa las variables:

```bash
cp .env.example .env.local
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script SQL de `supabase/schema.sql` en el SQL Editor
3. Copia las credenciales a `.env.local`

### 4. Configurar Stripe

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Habilita Stripe Connect para marketplace
3. Copia las API keys a `.env.local`

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
├── app/
│   ├── api/           # API Routes
│   ├── club/          # Panel de administración del club
│   ├── tienda/        # Tienda pública [slug]
│   └── ...
├── components/        # Componentes React
├── hooks/             # Custom hooks
├── lib/               # Utilidades y servicios
├── types/             # Tipos TypeScript
└── supabase/          # Schema SQL
```

## Flujo de Uso

1. **Club**: Se registra y configura su tienda (colores, logo, productos)
2. **Socios**: Visitan la tienda del club y compran productos
3. **Plataforma**: Fabrica bajo demanda y envía
4. **Club**: Recibe comisión por cada venta

## Licencia

MIT
