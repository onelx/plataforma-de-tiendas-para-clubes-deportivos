import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { 
  Club, 
  Producto, 
  ProductoConVariantes, 
  VarianteProducto,
  Pedido,
  PedidoConItems,
  ItemPedido,
  UsuarioClub,
  EstadisticasClub
} from "@/types";

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      clubs: {
        Row: Club;
        Insert: Omit<Club, "id" | "created_at">;
        Update: Partial<Omit<Club, "id" | "created_at">>;
      };
      usuarios_club: {
        Row: UsuarioClub;
        Insert: Omit<UsuarioClub, "id" | "created_at">;
        Update: Partial<Omit<UsuarioClub, "id" | "created_at">>;
      };
      productos: {
        Row: Producto;
        Insert: Omit<Producto, "id" | "created_at">;
        Update: Partial<Omit<Producto, "id" | "created_at">>;
      };
      variantes_producto: {
        Row: VarianteProducto;
        Insert: Omit<VarianteProducto, "id">;
        Update: Partial<Omit<VarianteProducto, "id">>;
      };
      pedidos: {
        Row: Pedido;
        Insert: Omit<Pedido, "id" | "numero_pedido" | "created_at">;
        Update: Partial<Omit<Pedido, "id" | "numero_pedido" | "created_at">>;
      };
      items_pedido: {
        Row: ItemPedido;
        Insert: Omit<ItemPedido, "id">;
        Update: Partial<Omit<ItemPedido, "id">>;
      };
    };
    Functions: {
      get_club_estadisticas: {
        Args: { p_club_id: string };
        Returns: EstadisticasClub;
      };
    };
  };
};

// Client-side Supabase client
export const createBrowserClient = () => {
  return createClientComponentClient<Database>();
};

// Server-side Supabase client (for Server Components)
export const createServerClient = async () => {
  const cookieStore = await cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// Admin Supabase client (uses service role key, bypasses RLS)
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Helper to get public Supabase URL for storage
export const getStoragePublicUrl = (bucket: string, path: string): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: unknown): string => {
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  return "Error desconocido";
};

// Type guard for Supabase responses
export const isSupabaseError = (
  response: { data: unknown; error: unknown }
): response is { data: null; error: { message: string } } => {
  return response.error !== null;
};
