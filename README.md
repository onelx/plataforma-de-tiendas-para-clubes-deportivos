# Plataforma de Tiendas para Clubes Deportivos

Plataforma que permite a clubes deportivos tener su propia tienda online con productos fabricados bajo demanda.

## Stack Tecnológico

- **Frontend:** Next.js 14 + Tailwind CSS
- **Backend:** Next.js API Routes + Supabase
- **Base de Datos:** Supabase PostgreSQL con RLS
- **Pagos:** Stripe Connect
- **Hosting:** Vercel + Supabase Cloud

## Instalación

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   npm install
   ```

3. Copia el archivo de variables de entorno:
   ```bash
   cp .env.example .env.local
   ```

4. Configura las variables en `.env.local` con tus credenciales de Supabase y Stripe

5. Ejecuta las migraciones en Supabase (ver `/supabase/migrations`)

6. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

7. Abre http://localhost:3000

## Estructura del Proyecto

```
├── app/                    # Rutas y páginas de Next.js
│   ├── [slug]/            # Tiendas de clubes (dinámico)
│   ├── api/               # API endpoints
│   └── dashboard/         # Panel de administración
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y servicios
├── hooks/                 # Custom hooks
└── types/                 # Definiciones TypeScript
```

## Funcionalidades

- **Tiendas personalizadas:** Cada club tiene su subdominio/slug con branding propio
- **Catálogo de productos:** Productos con variantes (talla, color)
- **Carrito de compras:** Persistencia local + sync
- **Checkout:** Integración con Stripe
- **Panel de club:** Gestión de productos, pedidos y estadísticas
- **Sistema de comisiones:** Reparto automático plataforma/club

## Licencia

MIT
