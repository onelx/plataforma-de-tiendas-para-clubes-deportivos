import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Cliente para uso en el navegador (componentes cliente)
export const createBrowserClient = () => {
  return createClientComponentClient<Database>()
}

// Cliente para uso en Server Components
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Cliente con permisos de servicio (solo para API routes y funciones server)
export const createServiceClient = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada')
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Cliente básico para uso general (sin auth helpers)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helpers para storage
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const uploadImage = async (
  bucket: string, 
  path: string, 
  file: File
): Promise<string> => {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  })
  
  if (error) {
    throw new Error(`Error subiendo imagen: ${error.message}`)
  }
  
  return getPublicUrl(bucket, path)
}

export const deleteImage = async (bucket: string, paths: string[]): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove(paths)
  
  if (error) {
    throw new Error(`Error eliminando imagen: ${error.message}`)
  }
}

// Helper para extraer path de URL pública
export const getPathFromPublicUrl = (url: string, bucket: string): string | null => {
  const match = url.match(new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`))
  return match ? match[1] : null
}
