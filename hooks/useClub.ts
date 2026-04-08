import { useState, useEffect } from 'react';
import { Club } from '@/types';

interface UseClubReturn {
  club: Club | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClub(slug: string): UseClubReturn {
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClub = async () => {
    if (!slug) {
      setIsLoading(false);
      setError('No slug provided');
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
        throw new Error('Error al cargar los datos del club');
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      setClub(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setClub(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [slug]);

  const refetch = async () => {
    await fetchClub();
  };

  return {
    club,
    isLoading,
    error,
    refetch,
  };
}
