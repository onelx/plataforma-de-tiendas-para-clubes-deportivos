// ==========================================
// Database Models
// ==========================================

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
}

export interface Producto {
  id: string;
  club_id: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  costo_produccion: number;
  categoria: string | null;
  imagenes: ProductoImagen[];
  activo: boolean;
  created_at: string;
}

export interface ProductoImagen {
  url: string;
  alt?: string;
  orden?: number;
}

export interface VarianteProducto {
  id: string;
  producto_id: string;
  talla: string | null;
  color: string | null;
  sku: string;
  stock: number;
  activo: boolean;
}

export interface Pedido {
  id: string;
  club_id: string;
  numero_pedido: string;
  estado: EstadoPedido;
  cliente_email: string;
  cliente_nombre: string;
  cliente_telefono: string | null;
  direccion_envio: DireccionEnvio;
  subtotal: number;
  costo_envio: number;
  total: number;
  comision_plataforma: number | null;
  pago_club: number | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  tracking_number: string | null;
  notas: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface ItemPedido {
  id: string;
  pedido_id: string;
  producto_id: string;
  variante_id: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// ==========================================
// Enums and Constants
// ==========================================

export type EstadoPedido = 
  | "pendiente"
  | "pagado"
  | "en_produccion"
  | "producido"
  | "enviado"
  | "entregado"
  | "cancelado"
  | "reembolsado";

export const ESTADOS_PEDIDO: Record<EstadoPedido, { label: string; color: string }> = {
  pendiente: { label: "Pendiente de pago", color: "bg-yellow-100 text-yellow-800" },
  pagado: { label: "Pagado", color: "bg-blue-100 text-blue-800" },
  en_produccion: { label: "En producción", color: "bg-purple-100 text-purple-800" },
  producido: { label: "Producido", color: "bg-indigo-100 text-indigo-800" },
  enviado: { label: "Enviado", color: "bg-cyan-100 text-cyan-800" },
  entregado: { label: "Entregado", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-gray-100 text-gray-800" },
  reembolsado: { label: "Reembolsado", color: "bg-red-100 text-red-800" },
};

export const CATEGORIAS_PRODUCTO = [
  "camisetas",
  "pantalones",
  "sudaderas",
  "chaquetas",
  "accesorios",
  "equipamiento",
  "otros",
] as const;

export type CategoriaProducto = typeof CATEGORIAS_PRODUCTO[number];

export const TALLAS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
export type Talla = typeof TALLAS[number];

export const COLORES = [
  { nombre: "Negro", valor: "#000000" },
  { nombre: "Blanco", valor: "#FFFFFF" },
  { nombre: "Rojo", valor: "#EF4444" },
  { nombre: "Azul", valor: "#3B82F6" },
  { nombre: "Verde", valor: "#22C55E" },
  { nombre: "Amarillo", valor: "#EAB308" },
  { nombre: "Naranja", valor: "#F97316" },
  { nombre: "Morado", valor: "#A855F7" },
  { nombre: "Gris", valor: "#6B7280" },
  { nombre: "Rosa", valor: "#EC4899" },
] as const;

// ==========================================
// API Types
// ==========================================

export interface DireccionEnvio {
  nombre: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  telefono?: string;
  instrucciones?: string;
}

export interface CreatePedidoInput {
  club_id: string;
  cliente_email: string;
  cliente_nombre: string;
  cliente_telefono?: string;
  direccion_envio: DireccionEnvio;
  items: CreateItemPedidoInput[];
}

export interface CreateItemPedidoInput {
  producto_id: string;
  variante_id?: string;
  cantidad: number;
}

export interface CreateProductoInput {
  nombre: string;
  descripcion?: string;
  precio_base: number;
  costo_produccion: number;
  categoria?: CategoriaProducto;
  imagenes?: ProductoImagen[];
  variantes?: CreateVarianteInput[];
}

export interface UpdateProductoInput extends Partial<CreateProductoInput> {
  activo?: boolean;
}

export interface CreateVarianteInput {
  talla?: string;
  color?: string;
  sku?: string;
  stock?: number;
}

export interface UpdateClubInput {
  nombre?: string;
  logo_url?: string;
  color_primario?: string;
  color_secundario?: string;
}

// ==========================================
// Cart Types
// ==========================================

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

// ==========================================
// Response Types
// ==========================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// Extended Types (with relations)
// ==========================================

export interface ProductoConVariantes extends Producto {
  variantes: VarianteProducto[];
}

export interface PedidoConItems extends Pedido {
  items: ItemPedidoConProducto[];
  club?: Club;
}

export interface ItemPedidoConProducto extends ItemPedido {
  producto: Producto;
  variante: VarianteProducto | null;
}

export interface ClubConEstadisticas extends Club {
  total_productos: number;
  total_pedidos: number;
  total_ventas: number;
}

// ==========================================
// Dashboard Stats Types
// ==========================================

export interface EstadisticasClub {
  ventas_totales: number;
  ventas_mes: number;
  pedidos_totales: number;
  pedidos_mes: number;
  comisiones_pagadas: number;
  productos_activos: number;
  productos_top: ProductoTop[];
  ventas_por_mes: VentaMensual[];
}

export interface ProductoTop {
  producto_id: string;
  nombre: string;
  cantidad_vendida: number;
  ingresos: number;
}

export interface VentaMensual {
  mes: string;
  total: number;
  cantidad: number;
}

// ==========================================
// Form Types
// ==========================================

export interface CheckoutFormData {
  email: string;
  nombre: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  instrucciones?: string;
}

export interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio_base: number;
  costo_produccion: number;
  categoria: CategoriaProducto;
  imagenes: ProductoImagen[];
  variantes: VarianteFormData[];
}

export interface VarianteFormData {
  id?: string;
  talla: string;
  color: string;
  sku: string;
  stock: number;
  activo: boolean;
}

// ==========================================
// Auth Types
// ==========================================

export interface UserSession {
  id: string;
  email: string;
  club_id: string | null;
  club_slug: string | null;
  rol: string | null;
}

// ==========================================
// Stripe Types
// ==========================================

export interface CreateCheckoutSessionInput {
  pedido_id: string;
  success_url: string;
  cancel_url: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      metadata?: Record<string, string>;
      payment_intent?: string;
      amount_total?: number;
      customer_email?: string;
    };
  };
}

// ==========================================
// Filter Types
// ==========================================

export interface ProductosFilter {
  categoria?: CategoriaProducto;
  activo?: boolean;
  busqueda?: string;
  ordenar?: "nombre" | "precio_asc" | "precio_desc" | "reciente";
}

export interface PedidosFilter {
  estado?: EstadoPedido;
  desde?: string;
  hasta?: string;
  busqueda?: string;
}
