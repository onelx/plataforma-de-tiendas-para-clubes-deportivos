"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User, Session } from '@supabase/supabase-js';
import type { UsuarioClub } from '@/types';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  usuarioClub: UsuarioClub | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, clubId: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetchUsuarioClub: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [usuarioClub, setUsuarioClub] = useState<UsuarioClub | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientComponentClient();

  const fetchUsuarioClub = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_club')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching usuario_club:', error);
        setUsuarioClub(null);
        return;
      }

      setUsuarioClub(data);
    } catch (error) {
      console.error('Error in fetchUsuarioClub:', error);
      setUsuarioClub(null);
    }
  }, [supabase]);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUsuarioClub(session.user.id);
      } else {
        setUsuarioClub(null);
      }
      
      setIsLoading(false);
    });

    // Escuchar cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUsuarioClub(session.user.id);
      } else {
        setUsuarioClub(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchUsuarioClub]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUsuarioClub(data.user.id);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, clubId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            club_id: clubId,
          },
        },
      });

      if (error) throw error;

      // El trigger de la DB debería crear automáticamente el registro en usuarios_club
      if (data.user) {
        await fetchUsuarioClub(data.user.id);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setUsuarioClub(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refetchUsuarioClub = async () => {
    if (user) {
      await fetchUsuarioClub(user.id);
    }
  };

  return {
    user,
    session,
    usuarioClub,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refetchUsuarioClub,
  };
}
