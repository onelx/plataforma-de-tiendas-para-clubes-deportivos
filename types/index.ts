// Tipos principales de la aplicación

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

export interface Producto {
  id: string;
  club_id: string;
  nombre: string;
  descripcion: string;
  precio_base: number;
  costo_produccion: number;
  categoria: string;
  imagenes: string[];
  activo: boolean;
  created_at: string;
  variantes?: VarianteProducto[];
}

export interface VarianteProducto {
  id: string;
  producto_id: string;
  talla: string;
  color: string;
  sku: string;
  activo: boolean;
}

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
}

export interface ItemPedido {
  id: string;
  pedido_id: string;
  producto_id: string;
  variante_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
  variante?: VarianteProducto;
}

export interface DireccionEnvio {
  nombre: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  telefono: string;
}

export type EstadoPedido = 
  | "pendiente" 
  | "pagado" 
  | "en_produccion" 
  | "enviado" 
  | "entregado" 
  | "cancelado";

// Tipo para el carrito de compras
export interface CartItem {
  producto: Producto;
  variante: VarianteProducto;
  cantidad: number;
}

export interface Cart {
  items: CartItem[];
  clubId: string;
}
