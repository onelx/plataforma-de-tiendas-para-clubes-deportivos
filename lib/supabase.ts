import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export function createBrowserClient() {
  return createClientComponentClient();
}

export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getSession() {
  const client = createBrowserClient();
  const {
    data: { session },
  } = await client.auth.getSession();
  return session;
}

export async function getUser() {
  const client = createBrowserClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}

export async function signIn(email: string, password: string) {
  const client = createBrowserClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email: string, password: string) {
  const client = createBrowserClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signOut() {
  const client = createBrowserClient();
  const { error } = await client.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  const client = createBrowserClient();
  const { data, error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { data, error };
}

export async function updatePassword(newPassword: string) {
  const client = createBrowserClient();
  const { data, error } = await client.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
}

export function getStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const client = createBrowserClient();

  const { data, error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    return { url: null, error };
  }

  const url = getStorageUrl(bucket, data.path);
  return { url, error: null };
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: Error | null }> {
  const client = createBrowserClient();
  const { error } = await client.storage.from(bucket).remove([path]);
  return { error };
}
