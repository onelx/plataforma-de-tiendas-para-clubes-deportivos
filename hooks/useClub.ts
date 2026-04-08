"use client";

import { useState, useEffect } from 'react';
import type { Club } from '@/types';

interface UseClubReturn {
  club: Club | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useClub(slug: string): UseClubReturn {
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClub = async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/clubs/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Club no encontrado');
        }
        throw new Error('Error al cargar el club');
      }

      const data = await response.json();
      setClub(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      setClub(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [slug]);

  return {
    club,
    isLoading,
    error,
    refetch: fetchClub,
  };
}
