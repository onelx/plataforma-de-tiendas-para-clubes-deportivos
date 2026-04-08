# IdeaForge Club Stores

Plataforma de tiendas online para clubes deportivos con producción bajo demanda.

## 🚀 Características

- **Tiendas personalizadas**: Cada club tiene su propia tienda con branding (colores, logo)
- **Catálogo de productos**: Gestión de productos con variantes (tallas, colores)
- **Checkout integrado**: Pagos seguros con Stripe Connect
- **Panel de administración**: Dashboard para clubes con estadísticas y gestión de pedidos
- **Producción bajo demanda**: Los productos se fabrican cuando se compran

## 📋 Requisitos

- Node.js 18.17 o superior
- Cuenta de Supabase
- Cuenta de Stripe (con Connect habilitado)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd ideaforge-club-stores
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase y Stripe.

### 4. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script SQL de migración (ver `/supabase/migrations`)
3. Configura las políticas RLS según el esquema

### 5. Configurar Stripe

1. Activa Stripe Connect en tu dashboard de Stripe
2. Configura el webhook apuntando a `/api/webhooks/stripe`
3. Añade los eventos: `checkout.session.completed`, `payment_intent.succeeded`

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
├── app/
│   ├── (tienda)/           # Rutas públicas de tienda
│   │   └── [slug]/         # Tienda de cada club
│   ├── (dashboard)/        # Panel de administración
│   │   └── club/           # Dashboard del club
│   ├── api/                # API Routes
│   └── layout.tsx          # Layout raíz
├── components/
│   ├── tienda/             # Componentes de tienda
│   ├── dashboard/          # Componentes de dashboard
│   └── ui/                 # Componentes shadcn/ui
├── hooks/                  # Custom hooks
├── lib/                    # Utilidades y configuración
├── services/               # Lógica de negocio
└── types/                  # Definiciones TypeScript
```

## 🔐 Autenticación

- Los compradores no necesitan cuenta (checkout como invitado)
- Los administradores de club usan Supabase Auth
- RLS protege los datos por club

## 💳 Flujo de Pagos

1. Cliente añade productos al carrito
2. Procede al checkout
3. Se crea sesión de Stripe Checkout
4. Stripe procesa el pago (Split con Connect)
5. Webhook confirma y crea el pedido
6. El club recibe notificación

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repo a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Variables de producción

Asegúrate de:
- Usar claves de Stripe en modo live
- Configurar `NEXT_PUBLIC_APP_URL` con tu dominio
- Actualizar el webhook de Stripe

## 📊 Base de Datos

### Tablas principales

- `clubs`: Datos y configuración de cada club
- `usuarios_club`: Relación usuarios-clubes con roles
- `productos`: Catálogo de productos
- `variantes_producto`: Variantes (talla, color)
- `pedidos`: Pedidos realizados
- `items_pedido`: Líneas de cada pedido

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit (`git commit -m 'Añade nueva funcionalidad'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT
