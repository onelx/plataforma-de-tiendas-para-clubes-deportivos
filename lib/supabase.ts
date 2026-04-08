import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { 
  Club, 
  Producto, 
  ProductoConVariantes, 
  VarianteProducto, 
  Pedido, 
  PedidoConItems, 
  ItemPedido,
  UsuarioClub 
} from '@/types'

// Tipos para la base de datos de Supabase
export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: Club
        Insert: Omit<Club, 'id' | 'created_at'>
        Update: Partial<Omit<Club, 'id' | 'created_at'>>
      }
      usuarios_club: {
        Row: UsuarioClub
        Insert: Omit<UsuarioClub, 'id' | 'created_at'>
        Update: Partial<Omit<UsuarioClub, 'id' | 'created_at'>>
      }
      productos: {
        Row: Producto
        Insert: Omit<Producto, 'id' | 'created_at'>
        Update: Partial<Omit<Producto, 'id' | 'created_at'>>
      }
      variantes_producto: {
        Row: VarianteProducto
        Insert: Omit<VarianteProducto, 'id'>
        Update: Partial<Omit<VarianteProducto, 'id'>>
      }
      pedidos: {
        Row: Pedido
        Insert: Omit<Pedido, 'id' | 'created_at'>
        Update: Partial<Omit<Pedido, 'id' | 'created_at'>>
      }
      items_pedido: {
        Row: ItemPedido
        Insert: Omit<ItemPedido, 'id'>
        Update: Partial<Omit<ItemPedido, 'id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Variables de entorno con validación
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Cliente para el navegador (con auth del usuario)
export function createClient() {
  return createBrowserClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!
  )
}

// Cliente para el servidor (con auth del usuario via cookies)
export function createServerClient() {
  return createSupabaseClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

// Cliente admin para el servidor (bypasea RLS)
export function createAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createSupabaseClient<Database>(
    supabaseUrl!,
    supabaseServiceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

// Singleton del cliente para el navegador
let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // En el servidor, crear un nuevo cliente cada vez
    return createServerClient()
  }
  
  // En el navegador, usar singleton
  if (!browserClient) {
    browserClient = createClient()
  }
  
  return browserClient
}

// Helper para manejar errores de Supabase
export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string; error_description?: string; code?: string }
    return err.message || err.error_description || err.code || 'Error desconocido'
  }
  
  return 'Error desconocido'
}

// Helper para verificar si el usuario está autenticado
export async function getAuthUser() {
  const supabase = getSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

// Helper para obtener el club del usuario autenticado
export async function getUserClub() {
  const user = await getAuthUser()
  
  if (!user) {
    return null
  }
  
  const supabase = getSupabaseClient()
  
  const { data: usuarioClub, error } = await supabase
    .from('usuarios_club')
    .select(`
      *,
      club:clubs(*)
    `)
    .eq('auth_user_id', user.id)
    .single()
  
  if (error || !usuarioClub) {
    return null
  }
  
  return usuarioClub as UsuarioClub & { club: Club }
}

// Tipos de respuesta para queries comunes
export type SupabaseQueryResult<T> = {
  data: T | null
  error: Error | null
}

export type SupabaseListResult<T> = {
  data: T[] | null
  error: Error | null
  count: number | null
}
