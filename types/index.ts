// ============================================
// Database Models
// ============================================

export interface Club {
  id: string;
  slug: string;
  nombre: string;
  logo_url: string | null;
  color_primario: string;
  color_secundario: string;
  stripe_account_id: string | null;
  comision_porcentaje: number;
  activo: boolean;
  created_at: string;
}

export interface UsuarioClub {
  id: string;
  club_id: string;
  auth_user_id: string;
  rol: "admin" | "editor" | "viewer";
  created_at: string;
  club?: Club;
}

export interface Producto {
  id: string;
  club_id: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  costo_produccion: number;
  categoria: string | null;
  imagenes: string[];
  activo: boolean;
  created_at: string;
  variantes?: VarianteProducto[];
  club?: Club;
}

export interface VarianteProducto {
  id: string;
  producto_id: string;
  talla: string | null;
  color: string | null;
  sku: string;
  activo: boolean;
  producto?: Producto;
}

export interface DireccionEnvio {
  nombre: string;
  apellido: string;
  direccion: string;
  direccion2?: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  telefono: string;
}

export type EstadoPedido = 
  | "pendiente"
  | "pagado"
  | "en_produccion"
  | "producido"
  | "enviado"
  | "entregado"
  | "cancelado";

export interface Pedido {
  id: string;
  club_id: string;
  numero_pedido: string;
  estado: EstadoPedido;
  cliente_email: string;
  cliente_nombre: string;
  direccion_envio: DireccionEnvio;
  subtotal: number;
  costo_envio: number;
  total: number;
  comision_plataforma: number;
  pago_club: number;
  stripe_payment_intent_id: string | null;
  tracking_number: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  items?: ItemPedido[];
  club?: Club;
}

export interface ItemPedido {
  id: string;
  pedido_id: string;
  producto_id: string;
  variante_id: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
  variante?: VarianteProducto;
}

// ============================================
// Cart Types
// ============================================

export interface CartItem {
  producto_id: string;
  variante_id: string | null;
  cantidad: number;
  producto: Producto;
  variante: VarianteProducto | null;
}

export interface Cart {
  club_slug: string;
  items: CartItem[];
  subtotal: number;
  costo_envio: number;
  total: number;
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreatePedidoRequest {
  club_slug: string;
  cliente_email: string;
  cliente_nombre: string;
  direccion_envio: DireccionEnvio;
  items: {
    producto_id: string;
    variante_id: string | null;
    cantidad: number;
  }[];
}

export interface CreatePedidoResponse {
  pedido: Pedido;
  checkout_url: string;
}

export interface CreateCheckoutSessionRequest {
  pedido_id: string;
  success_url: string;
  cancel_url: string;
}

export interface CreateCheckoutSessionResponse {
  session_id: string;
  checkout_url: string;
}

export interface UpdateEstadoPedidoRequest {
  estado: EstadoPedido;
  tracking_number?: string;
}

// ============================================
// Dashboard Statistics Types
// ============================================

export interface EstadisticasClub {
  ventas_totales: number;
  ventas_mes_actual: number;
  pedidos_totales: number;
  pedidos_mes_actual: number;
  comisiones_pagadas: number;
  ganancias_netas: number;
  productos_activos: number;
  pedidos_pendientes: number;
  productos_top: ProductoTop[];
  ventas_por_mes: VentasMes[];
}

export interface ProductoTop {
  producto_id: string;
  nombre: string;
  cantidad_vendida: number;
  ingresos: number;
}

export interface VentasMes {
  mes: string;
  ventas: number;
  pedidos: number;
}

// ============================================
// Form Types
// ============================================

export interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio_base: number;
  costo_produccion: number;
  categoria: string;
  imagenes: string[];
  activo: boolean;
  variantes: VarianteFormData[];
}

export interface VarianteFormData {
  id?: string;
  talla: string;
  color: string;
  sku: string;
  activo: boolean;
}

export interface ClubPerfilFormData {
  nombre: string;
  logo_url: string;
  color_primario: string;
  color_secundario: string;
}

export interface CheckoutFormData {
  email: string;
  nombre: string;
  apellido: string;
  direccion: string;
  direccion2?: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  telefono: string;
}

// ============================================
// UI State Types
// ============================================

export interface FilterState {
  categoria: string | null;
  precio_min: number | null;
  precio_max: number | null;
  ordenar: "precio_asc" | "precio_desc" | "nombre" | "reciente";
}

export interface PaginationState {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// ============================================
// Auth Types
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    nombre?: string;
    avatar_url?: string;
  };
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// ============================================
// API Error Types
// ============================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// ============================================
// Webhook Types
// ============================================

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

// ============================================
// Utility Types
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Category constants
export const CATEGORIAS_PRODUCTO = [
  "Camisetas",
  "Pantalones",
  "Buzos",
  "Camperas",
  "Accesorios",
  "Equipamiento",
  "Otros",
] as const;

export type CategoriaProducto = typeof CATEGORIAS_PRODUCTO[number];

// Tallas constants
export const TALLAS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
export type Talla = typeof TALLAS[number];

// Colores constants
export const COLORES = [
  { nombre: "Negro", valor: "#000000" },
  { nombre: "Blanco", valor: "#FFFFFF" },
  { nombre: "Rojo", valor: "#EF4444" },
  { nombre: "Azul", valor: "#3B82F6" },
  { nombre: "Verde", valor: "#22C55E" },
  { nombre: "Amarillo", valor: "#EAB308" },
  { nombre: "Naranja", valor: "#F97316" },
  { nombre: "Violeta", valor: "#8B5CF6" },
  { nombre: "Rosa", valor: "#EC4899" },
  { nombre: "Gris", valor: "#6B7280" },
] as const;

// Estados de pedido con metadata
export const ESTADOS_PEDIDO: Record<EstadoPedido, { label: string; color: string; icon: string }> = {
  pendiente: { label: "Pendiente de pago", color: "yellow", icon: "Clock" },
  pagado: { label: "Pagado", color: "green", icon: "CreditCard" },
  en_produccion: { label: "En producción", color: "blue", icon: "Factory" },
  producido: { label: "Producido", color: "purple", icon: "Package" },
  enviado: { label: "Enviado", color: "indigo", icon: "Truck" },
  entregado: { label: "Entregado", color: "emerald", icon: "CheckCircle" },
  cancelado: { label: "Cancelado", color: "red", icon: "XCircle" },
};
