import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Tipos de la base de datos
export type Database = {
  public: {
    Tables: {
      clubs: {
        Row: {
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
        };
        Insert: Omit<Database["public"]["Tables"]["clubs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["clubs"]["Insert"]>;
      };
      usuarios_club: {
        Row: {
          id: string;
          club_id: string;
          auth_user_id: string;
          rol: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["usuarios_club"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["usuarios_club"]["Insert"]>;
      };
      productos: {
        Row: {
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
        };
        Insert: Omit<Database["public"]["Tables"]["productos"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["productos"]["Insert"]>;
      };
      variantes_producto: {
        Row: {
          id: string;
          producto_id: string;
          talla: string | null;
          color: string | null;
          sku: string;
          activo: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["variantes_producto"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["variantes_producto"]["Insert"]>;
      };
      pedidos: {
        Row: {
          id: string;
          club_id: string;
          numero_pedido: string;
          estado: string;
          cliente_email: string;
          cliente_nombre: string;
          direccion_envio: Record<string, unknown>;
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
        };
        Insert: Omit<Database["public"]["Tables"]["pedidos"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["pedidos"]["Insert"]>;
      };
      items_pedido: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string;
          variante_id: string | null;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
        };
        Insert: Omit<Database["public"]["Tables"]["items_pedido"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["items_pedido"]["Insert"]>;
      };
    };
  };
};

// Cliente para el navegador (componentes cliente)
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Cliente con service role para operaciones del servidor (API routes)
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Singleton para el cliente del navegador
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseClient should only be called on the client");
  }
  
  if (!browserClient) {
    browserClient = createClient();
  }
  
  return browserClient;
}

// Helper para manejar errores de Supabase
export function handleSupabaseError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  return "Error desconocido";
}

// Helper para verificar si el usuario está autenticado
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Helper para obtener el club del usuario actual
export async function getCurrentUserClub() {
  const supabase = createClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const { data: usuarioClub, error } = await supabase
    .from("usuarios_club")
    .select(`
      *,
      club:clubs(*)
    `)
    .eq("auth_user_id", user.id)
    .single();
  
  if (error || !usuarioClub) {
    return null;
  }
  
  return usuarioClub;
}
